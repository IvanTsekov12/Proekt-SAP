async function loadDashboard() {
    const docsValue = document.getElementById('stat-total-docs');
    if (!docsValue) return;

    try {
        const documents = await getDocuments();
        window.DMSState.allDocuments = documents || [];

        let totalVersions = 0;
        let pendingReview = 0;
        let approved = 0;
        const pendingVersionsList = [];
        const statusCounts = {
            DRAFT: 0,
            IN_REVIEW: 0,
            APPROVED: 0,
            REJECTED: 0,
            ACTIVE: 0
        };

        for (const doc of window.DMSState.allDocuments) {
            try {
                const versions = await getVersions(doc.id);
                window.DMSState.allVersionsData[doc.id] = versions || [];
                (versions || []).forEach((version) => {
                    totalVersions += 1;
                    if (version.status === 'IN_REVIEW') {
                        pendingReview += 1;
                        pendingVersionsList.push({
                            ...version,
                            documentId: doc.id,
                            documentTitle: doc.title
                        });
                    }
                    if (version.status === 'APPROVED' || version.status === 'ACTIVE') {
                        approved += 1;
                    }
                    if (statusCounts[version.status] !== undefined) {
                        statusCounts[version.status] += 1;
                    }
                });
            } catch (error) {
                console.error('Error loading versions for doc', doc.id, error);
            }
        }

        docsValue.textContent = window.DMSState.allDocuments.length;
        const versionsValue = document.getElementById('stat-total-versions');
        const pendingValue = document.getElementById('stat-pending-review');
        const approvedValue = document.getElementById('stat-approved');
        if (versionsValue) versionsValue.textContent = totalVersions;
        if (pendingValue) pendingValue.textContent = pendingReview;
        if (approvedValue) approvedValue.textContent = approved;

        renderStatusChart(statusCounts, totalVersions);
        renderRecentDocs(window.DMSState.allDocuments.slice(0, 5));
        renderPendingVersions(pendingVersionsList.slice(0, 5));
        renderRecentActivity();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function renderStatusChart(statusCounts, total) {
    const chartContainer = document.getElementById('status-chart');
    if (!chartContainer) return;
    const maxValue = Math.max(...Object.values(statusCounts), 1);
    const statusLabels = {
        DRAFT: t('status_draft'),
        IN_REVIEW: t('status_in_review'),
        APPROVED: t('section_approved'),
        REJECTED: t('section_rejected'),
        ACTIVE: t('status_active')
    };

    chartContainer.innerHTML = Object.entries(statusCounts).map(([status, count]) => {
        const height = total > 0 ? (count / maxValue) * 150 : 0;
        return `
            <div class="bar-item">
                <div class="bar ${status.toLowerCase()}" style="height: ${Math.max(height, 4)}px" data-value="${count}"></div>
                <span class="bar-label">${statusLabels[status]}</span>
            </div>
        `;
    }).join('');
}

function renderRecentDocs(documents) {
    const container = document.getElementById('recent-docs');
    if (!container) return;
    if (!documents || documents.length === 0) {
        container.innerHTML = `<div class="empty-list-message"><i class="fas fa-folder-open"></i>${t('toast_no_documents')}</div>`;
        return;
    }

    container.innerHTML = documents.map((doc) => `
        <div class="recent-item" data-doc-id="${doc.id}" data-doc-title="${escapeHtml(doc.title)}">
            <i class="fas fa-file-alt"></i>
            <div class="recent-item-info">
                <span class="recent-item-title">${escapeHtml(doc.title)}</span>
                <span class="recent-item-date">${formatDate(doc.createdAt)}</span>
            </div>
            <i class="fas fa-chevron-right" style="color: var(--text-muted)"></i>
        </div>
    `).join('');

    container.querySelectorAll('.recent-item').forEach((item) => {
        item.addEventListener('click', () => {
            setCurrentDocument(item.dataset.docId, item.dataset.docTitle);
            window.location.href = 'versions.html';
        });
    });
}

function renderPendingVersions(versions) {
    const container = document.getElementById('pending-versions');
    if (!container) return;
    const canReview = isReviewer() || isAdmin();
    if (!versions || versions.length === 0) {
        container.innerHTML = `<div class="empty-list-message"><i class="fas fa-check-circle"></i>${t('toast_no_pending_versions')}</div>`;
        return;
    }

    container.innerHTML = versions.map((version) => `
        <div class="pending-item">
            <div class="pending-item-info">
                <div class="pending-item-title">${escapeHtml(version.documentTitle)}</div>
                <div class="pending-item-meta">
                    <span><i class="fas fa-code-branch"></i> v${version.versionNumber}</span>
                </div>
            </div>
            ${canReview ? `
            <div class="pending-item-actions">
                <button class="btn-approve-small" data-action="approve" data-id="${version.id}" data-version="${version.versionNumber}" data-title="${escapeHtml(version.documentTitle)}" title="Одобри">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-reject-small" data-action="reject" data-id="${version.id}" data-version="${version.versionNumber}" data-title="${escapeHtml(version.documentTitle)}" title="Отхвърли">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ` : ''}
        </div>
    `).join('');

    container.querySelectorAll('button[data-action]').forEach((button) => {
        button.addEventListener('click', async () => {
            const fn = button.dataset.action === 'approve' ? quickApprove : quickReject;
            await fn(button.dataset.id, button.dataset.version, button.dataset.title);
        });
    });
}

function renderRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    const logs = getAuditLogs().slice(0, 6);
    if (!logs || logs.length === 0) {
        container.innerHTML = `<div class="empty-list-message"><i class="fas fa-history"></i>${t('toast_no_activity')}</div>`;
        return;
    }

    const actionIcons = {
        CREATE: 'fa-plus',
        UPDATE: 'fa-edit',
        DELETE: 'fa-trash',
        APPROVE: 'fa-check',
        REJECT: 'fa-times',
        LOGIN: 'fa-sign-in-alt',
        EXPORT: 'fa-download'
    };

    container.innerHTML = logs.map((log) => `
        <div class="activity-item">
            <div class="activity-icon ${log.action.toLowerCase()}">
                <i class="fas ${actionIcons[log.action] || 'fa-info'}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${escapeHtml(getDashboardAuditDescription(log))}</div>
                <div class="activity-time">${formatTimeAgo(log.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function getDashboardAuditDescription(log) {
    const details = log.details || {};
    const eventType = details.eventType || '';
    const action = String(log && log.action ? log.action : '').toUpperCase();

    switch (eventType) {
        case 'login':
            return t('audit_login_description');
        case 'document_created':
            return t('audit_document_created', { title: details.documentTitle || '' });
        case 'document_deleted':
            return t('audit_document_deleted', { title: details.documentTitle || '' });
        case 'version_created':
            return t('audit_version_created', {
                version: details.versionNumber || '?',
                title: details.documentTitle || ''
            });
        case 'version_submitted':
            return t('audit_version_submitted', {
                version: details.versionNumber || '?',
                title: details.documentTitle || ''
            });
        case 'version_approved':
            return t('audit_version_approved', {
                version: details.versionNumber || '?',
                title: details.documentTitle || ''
            }) + (details.comment ? t('audit_comment_suffix', { comment: details.comment }) : '');
        case 'version_rejected':
            return t('audit_version_rejected', {
                version: details.versionNumber || '?',
                title: details.documentTitle || ''
            }) + (details.comment ? t('audit_reason_suffix', { comment: details.comment }) : '');
        case 'version_activated':
            return t('audit_version_activated', {
                version: details.versionNumber || '?',
                title: details.documentTitle || ''
            });
        case 'user_created':
            return t('audit_user_created', {
                username: details.username || '',
                role: details.role || ''
            });
        case 'user_deleted':
            return t('audit_user_deleted', { username: details.username || '' });
        case 'document_exported':
            return t('audit_document_exported', {
                title: details.documentTitle || '',
                versionSuffix: details.versionNumber ? t('audit_version_suffix', { version: details.versionNumber }) : '',
                format: String(details.format || '').toUpperCase()
            });
        default:
            break;
    }

    if (action === 'LOGIN') {
        return t('audit_login_description');
    }

    if (action === 'CREATE' && details.username) {
        return t('audit_user_created', {
            username: details.username || '',
            role: details.role || ''
        });
    }

    if (action === 'DELETE' && details.username && !details.documentTitle) {
        return t('audit_user_deleted', { username: details.username || '' });
    }

    if (action === 'CREATE' && details.versionId) {
        return t('audit_version_created', {
            version: details.versionNumber || '?',
            title: details.documentTitle || ''
        });
    }

    if (action === 'UPDATE' && details.versionId && details.documentId) {
        return t('audit_version_activated', {
            version: details.versionNumber || '?',
            title: details.documentTitle || ''
        });
    }

    if (action === 'UPDATE' && details.versionId) {
        return t('audit_version_submitted', {
            version: details.versionNumber || '?',
            title: details.documentTitle || ''
        });
    }

    if (action === 'APPROVE' && details.versionId) {
        return t('audit_version_approved', {
            version: details.versionNumber || '?',
            title: details.documentTitle || ''
        }) + (details.comment ? t('audit_comment_suffix', { comment: details.comment }) : '');
    }

    if (action === 'REJECT' && details.versionId) {
        return t('audit_version_rejected', {
            version: details.versionNumber || '?',
            title: details.documentTitle || ''
        }) + (details.comment ? t('audit_reason_suffix', { comment: details.comment }) : '');
    }

    if (action === 'EXPORT' && details.documentTitle) {
        return t('audit_document_exported', {
            title: details.documentTitle || '',
            versionSuffix: details.versionNumber ? t('audit_version_suffix', { version: details.versionNumber }) : '',
            format: String(details.format || '').toUpperCase()
        });
    }

    if (action === 'CREATE' && details.documentTitle) {
        return t('audit_document_created', { title: details.documentTitle || '' });
    }

    if (action === 'DELETE' && details.documentTitle) {
        return t('audit_document_deleted', { title: details.documentTitle || '' });
    }

    return log.description || '';
}

async function quickApprove(versionId, versionNumber, documentTitle) {
    try {
        await approveVersion(versionId, versionNumber, documentTitle);
        showToast(t('toast_version_approved'), 'success');
        loadDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function quickReject(versionId, versionNumber, documentTitle) {
    try {
        await rejectVersion(versionId, versionNumber, documentTitle);
        showToast(t('toast_version_rejected'), 'warning');
        loadDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadDashboard);

window.refreshPageTranslations = loadDashboard;
