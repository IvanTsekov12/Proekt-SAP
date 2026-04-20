function initDeleteDocumentPage() {
    const name = document.getElementById('delete-doc-name');
    const confirmButton = document.getElementById('confirm-delete-btn');
    const storedTitle = localStorage.getItem('dms_delete_document_title') || '';

    if (name) {
        name.textContent = storedTitle;
    }

    if (confirmButton) {
        confirmButton.addEventListener('click', handleDeleteDocumentConfirm);
    }
}

async function handleDeleteDocumentConfirm() {
    const documentId = localStorage.getItem('dms_delete_document_id');
    const documentTitle = localStorage.getItem('dms_delete_document_title') || '';
    if (!documentId) return;

    const button = document.getElementById('confirm-delete-btn');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span>';
    }

    try {
        await deleteDocument(documentId, documentTitle);
        showToast('Документът е изтрит успешно!', 'success');
        localStorage.removeItem('dms_delete_document_id');
        localStorage.removeItem('dms_delete_document_title');
        window.location.href = 'documents.html';
    } catch (error) {
        showToast(error.message || 'Грешка при изтриването на документа', 'error');
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-trash"></i> Изтрий';
        }
    }
}

document.addEventListener('DOMContentLoaded', initDeleteDocumentPage);
