function initCreateVersionPage() {
    const form = document.getElementById('create-version-form') || document.querySelector('form[action="versions.html"]');
    if (!form) return;
    form.addEventListener('submit', handleCreateVersionSubmit);
    preloadCurrentDocumentContent();
}

async function preloadCurrentDocumentContent() {
    const contentInput = document.getElementById('version-content-input');
    const documentId = getCurrentDocumentId();
    if (!contentInput || !documentId) return;

    try {
        const versions = await getVersions(documentId);
        if (Array.isArray(versions) && versions.length === 1 && versions[0].versionNumber === 1 && versions[0].status === 'REJECTED') {
            showToast(t('create_version_rejected_first'), 'warning');
            window.location.href = 'versions.html';
            return;
        }

        let sourceVersion = null;

        try {
            sourceVersion = await getActiveVersion(documentId);
        } catch (error) {
            if (versions && versions.length > 0) {
                sourceVersion = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
            }
        }

        if (sourceVersion && sourceVersion.content) {
            contentInput.value = sourceVersion.content;
        }
    } catch (error) {
        console.error('Error preloading current document content', error);
    }
}

async function handleCreateVersionSubmit(event) {
    event.preventDefault();
    const contentInput = document.getElementById('version-content-input');
    const content = contentInput ? contentInput.value : '';
    const documentId = getCurrentDocumentId();
    const documentTitle = getCurrentDocumentTitle();
    if (!content.trim() || !documentId) return;

    try {
        await createVersion(documentId, content, documentTitle);
        showToast(isAuthor() ? t('create_version_success_review') : t('create_version_success'), 'success');
        if (contentInput) {
            contentInput.value = '';
        }
        window.location.href = 'versions.html';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initCreateVersionPage);

window.refreshPageTranslations = initCreateVersionPage;
