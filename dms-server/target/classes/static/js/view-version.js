function initViewVersionPage() {
    const content = document.getElementById('view-version-content');
    const copyButton = document.getElementById('copy-content-btn');
    if (!content) return;

    const documentId = getCurrentDocumentId();
    const versionId = localStorage.getItem('dms_view_version_id');
    if (!documentId || !versionId) return;

    getVersions(documentId).then((versions) => {
        window.DMSState.allVersionsData[documentId] = versions || [];
        viewVersion(versionId);
    }).catch((error) => showToast(error.message, 'error'));

    if (copyButton) {
        copyButton.addEventListener('click', copyVersionContent);
    }
}

function copyVersionContent() {
    const content = document.getElementById('view-version-content');
    if (!content) return;

    navigator.clipboard.writeText(content.textContent).then(() => {
        showToast('Съдържанието е копирано', 'success');
        const button = document.getElementById('copy-content-btn');
        if (!button) return;
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            button.innerHTML = originalHtml;
        }, 1500);
    }).catch(() => {
        showToast('Грешка при копиране', 'error');
    });
}

document.addEventListener('DOMContentLoaded', initViewVersionPage);
