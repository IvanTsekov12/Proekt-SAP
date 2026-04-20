function initVersionsPage() {
    const versionsList = document.getElementById('versions-list');

    const documentId = getCurrentDocumentId();
    const documentTitle = getCurrentDocumentTitle();
    const titleEl = document.getElementById('doc-title');
    if (titleEl && documentTitle) {
        titleEl.textContent = documentTitle;
    }

    if (versionsList && documentId) {
        loadVersions(documentId);
    }
}

async function loadVersions(documentId) {
    const versionsList = document.getElementById('versions-list');
    if (!versionsList) return;
    versionsList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const versions = await getVersions(documentId);
        window.DMSState.allVersionsData[documentId] = versions || [];
        applyVersionsPagePermissions(versions || []);
        renderVersions(versions || []);
    } catch (error) {
        showToast(error.message, 'error');
        versionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Грешка при зареждане</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
    }
}

function isRejectedFirstVersionOnly(versions) {
    return Array.isArray(versions)
        && versions.length === 1
        && versions[0].versionNumber === 1
        && versions[0].status === 'REJECTED';
}

function applyVersionsPagePermissions(versions) {
    const isLockedRejectedDocument = isRejectedFirstVersionOnly(versions);
    const compareButton = document.querySelector('.header-actions a[href="compare.html"]');
    const exportButton = document.querySelector('.header-actions a[href="export-document.html"]');
    const createButton = document.querySelector('.header-actions a[href="create-version.html"]');

    if (compareButton) compareButton.style.display = isLockedRejectedDocument ? 'none' : '';
    if (exportButton) exportButton.style.display = isLockedRejectedDocument ? 'none' : '';
    if (createButton) createButton.style.display = isLockedRejectedDocument ? 'none' : '';
}

function renderVersions(versions) {
    const versionsList = document.getElementById('versions-list');
    if (!versionsList) return;

    if (!versions || versions.length === 0) {
        versionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-code-branch"></i>
                <h3>${t('versions_empty_title')}</h3>
                <p>${t('versions_empty_message')}</p>
            </div>
        `;
        return;
    }

    versions.sort((a, b) => b.versionNumber - a.versionNumber);
    versionsList.innerHTML = versions.map((version, index) => `
        <div class="version-card" data-id="${version.id}" style="animation-delay: ${index * 0.1}s">
            <div class="version-header">
                <div class="version-info">
                    <span class="version-number">v${version.versionNumber}</span>
                    <span class="status-badge ${version.status.toLowerCase()}">${getStatusText(version.status)}</span>
                </div>
            </div>
            <div class="version-content">${escapeHtml(version.content || t('no_content'))}</div>
            <div class="version-actions">${getVersionActions(version)}</div>
        </div>
    `).join('');

    addVersionActionListeners();
}

function getVersionActions(version) {
    const documentId = getCurrentDocumentId();
    const versions = window.DMSState.allVersionsData[documentId] || [];

    let actions = `
        <button class="btn-action btn-view" type="button" data-action="view" data-id="${version.id}" data-version="${version.versionNumber}">
            <i class="fas fa-eye"></i> ${t('action_view')}
        </button>
    `;

    if (isRejectedFirstVersionOnly(versions)) {
        return actions;
    }

    if (isReader()) {
        return actions;
    }

    if (isAuthor() || isAdmin()) {
        actions += `
            <button class="btn-action btn-export" type="button" data-action="export" data-id="${version.id}" data-version="${version.versionNumber}">
                <i class="fas fa-download"></i> ${t('action_export')}
            </button>
        `;
    }

    if ((isReviewer() || isAdmin()) && version.status === 'IN_REVIEW') {
        actions += `
            <button class="btn-action btn-approve" type="button" data-action="approve" data-id="${version.id}" data-version="${version.versionNumber}">
                <i class="fas fa-check"></i> ${t('action_approve')}
            </button>
            <button class="btn-action btn-reject" type="button" data-action="reject" data-id="${version.id}" data-version="${version.versionNumber}">
                <i class="fas fa-times"></i> ${t('action_reject')}
            </button>
        `;
    }

    if ((isAuthor() || isAdmin()) && version.status === 'APPROVED') {
        actions += `
            <button class="btn-action btn-activate" type="button" data-action="activate" data-id="${version.id}" data-version="${version.versionNumber}">
                <i class="fas fa-bolt"></i> ${t('action_activate')}
            </button>
        `;
    }

    return actions;
}

function addVersionActionListeners() {
    document.querySelectorAll('.version-actions button').forEach((button) => {
        button.addEventListener('click', async () => {
            const action = button.dataset.action;
            const versionId = button.dataset.id;
            const versionNumber = button.dataset.version;
            const documentId = getCurrentDocumentId();
            const documentTitle = getCurrentDocumentTitle();

            if (action === 'view') {
                localStorage.setItem('dms_view_version_id', versionId);
                window.location.href = 'view-version.html';
                return;
            }

            if (action === 'export') {
                localStorage.setItem('dms_export_version_id', versionId);
                window.location.href = 'export-document.html';
                return;
            }

            if (action === 'approve' || action === 'reject') {
                window.DMSState.pendingReviewAction = { action, versionId, versionNumber };
                localStorage.setItem('dms_pending_review', JSON.stringify(window.DMSState.pendingReviewAction));
                window.location.href = 'review-comment.html';
                return;
            }

            button.disabled = true;
            const originalHtml = button.innerHTML;
            button.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span>';

            try {
                if (action === 'activate') {
                    await activateVersion(documentId, versionId, versionNumber, documentTitle);
                    showToast(t('status_active'), 'success');
                }
                delete window.DMSState.allVersionsData[documentId];
                loadVersions(documentId);
            } catch (error) {
                showToast(error.message, 'error');
                button.disabled = false;
                button.innerHTML = originalHtml;
            }
        });
    });
}

function viewVersion(versionId) {
    const documentId = getCurrentDocumentId();
    const versions = window.DMSState.allVersionsData[documentId] || [];
    const version = versions.find((item) => item.id === versionId);
    if (!version) {
        showToast(t('version_not_found'), 'error');
        return;
    }

    const number = document.getElementById('view-version-number');
    const status = document.getElementById('view-version-status');
    const author = document.getElementById('view-version-author');
    const date = document.getElementById('view-version-date');
    const content = document.getElementById('view-version-content');

    if (number) number.textContent = `v${version.versionNumber}`;
    if (status) {
        status.innerHTML = `<span class="status-badge status-${version.status.toLowerCase().replace('_', '-')}">${getStatusText(version.status)}</span>`;
    }
    if (author) author.textContent = version.createdBy || t('unknown_user');
    if (date) date.textContent = formatDateTime(version.createdAt);
    if (content) content.textContent = version.content || t('no_content');
}

document.addEventListener('DOMContentLoaded', initVersionsPage);

window.refreshPageTranslations = initVersionsPage;
