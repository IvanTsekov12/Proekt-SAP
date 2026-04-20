async function initAuditPage() {
    const timeline = document.getElementById('audit-timeline');
    if (!timeline) return;
    await loadAuditLogs();
    const filter = document.getElementById('audit-filter');
    if (filter) {
        filter.addEventListener('change', handleAuditFilter);
    }
}

async function handleAuditFilter() {
    const filter = document.getElementById('audit-filter');
    await loadAuditLogs(filter ? filter.value : 'all');
}

async function loadAuditLogs(filter = 'all') {
    const logs = getAuditLogs();
    const visibleLogs = await getVisibleAuditLogs(logs);
    const normalizedFilter = String(filter || 'all').toUpperCase();
    const filtered = normalizedFilter === 'ALL'
        ? visibleLogs
        : visibleLogs.filter((log) => getNormalizedAuditAction(log) === normalizedFilter);
    renderAuditLogs(filtered);
}

async function getVisibleAuditLogs(logs) {
    if (!isAuthor()) {
        return logs;
    }

    try {
        const documents = await getDocuments();
        const documentIds = new Set((documents || []).map((doc) => String(doc.id)));
        const documentTitles = new Set((documents || []).map((doc) => String(doc.title || '').toLowerCase()));

        return logs.filter((log) => {
            const details = log.details || {};
            const documentId = details.documentId ? String(details.documentId) : '';
            const documentTitle = String(details.documentTitle || '').toLowerCase();

            return documentIds.has(documentId) || documentTitles.has(documentTitle);
        });
    } catch (error) {
        return logs.filter((log) => {
            const details = log.details || {};
            return details.documentId || details.documentTitle;
        });
    }
}

function getNormalizedAuditAction(log) {
    return String(log && log.action ? log.action : '').toUpperCase();
}

function getAuditDescription(log) {
    const details = log.details || {};
    const eventType = details.eventType || '';

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
            return getLegacyAuditDescription(log);
    }
}

function getLegacyAuditDescription(log) {
    const details = log.details || {};
    const action = getNormalizedAuditAction(log);

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

function renderAuditLogs(logs) {
    const container = document.getElementById('audit-timeline');
    if (!container) return;

    if (!logs || logs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>${t('no_records')}</h3>
                <p>${t('audit_empty')}</p>
            </div>
        `;
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

    const actionLabels = {
        CREATE: t('filter_create'),
        UPDATE: t('filter_update'),
        DELETE: t('filter_delete'),
        APPROVE: t('filter_approve'),
        REJECT: t('action_reject'),
        LOGIN: t('action_login'),
        EXPORT: t('action_export')
    };

    container.innerHTML = logs.map((log, index) => `
        <div class="audit-item" style="animation-delay: ${index * 0.05}s">
            <div class="audit-icon ${getNormalizedAuditAction(log).toLowerCase()}">
                <i class="fas ${actionIcons[getNormalizedAuditAction(log)] || 'fa-info'}"></i>
            </div>
            <div class="audit-content">
                <div class="audit-title">${actionLabels[getNormalizedAuditAction(log)] || escapeHtml(String(log.action || ''))}</div>
                <div class="audit-description">${escapeHtml(getAuditDescription(log))}</div>
                <div class="audit-meta">
                    <span><i class="fas fa-user"></i> ${escapeHtml(log.user)}</span>
                    <span><i class="fas fa-clock"></i> ${formatDateTime(log.timestamp)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', initAuditPage);

window.refreshPageTranslations = initAuditPage;
