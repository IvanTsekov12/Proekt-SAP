function initCreateDocumentPage() {
    const form = document.getElementById('create-doc-form') || document.querySelector('form[action="documents.html"]');
    if (!form) return;
    form.addEventListener('submit', handleCreateDocumentSubmit);
}

async function handleCreateDocumentSubmit(event) {
    event.preventDefault();
    const titleInput = document.getElementById('doc-title-input');
    const contentInput = document.getElementById('doc-content-input');
    const title = titleInput ? titleInput.value.trim() : '';
    const content = contentInput ? contentInput.value.trim() : '';
    if (!title || !content) return;

    try {
        const document = await createDocument(title);
        await createVersion(document.id, content, title);
        showToast(isAuthor() ? t('create_document_success_review') : t('create_document_success'), 'success');
        if (titleInput) {
            titleInput.value = '';
        }
        if (contentInput) {
            contentInput.value = '';
        }
        window.location.href = 'documents.html';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initCreateDocumentPage);

window.refreshPageTranslations = initCreateDocumentPage;
