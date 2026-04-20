function initReviewCommentPage() {
    const confirmButton = document.getElementById('confirm-review-btn');
    if (!confirmButton) return;

    const stored = localStorage.getItem('dms_pending_review');
    const pending = stored ? JSON.parse(stored) : null;
    if (pending) {
        updateReviewCommentUI(pending.action);
    }

    confirmButton.addEventListener('click', handleReviewConfirm);
}

function updateReviewCommentUI(action) {
    const modalTitle = document.getElementById('review-modal-title');
    const confirmText = document.getElementById('confirm-review-text');
    const confirmButton = document.getElementById('confirm-review-btn');

    if (!modalTitle || !confirmText || !confirmButton) return;

    if (action === 'approve') {
        modalTitle.innerHTML = '<i class="fas fa-check-circle"></i> Одобрение на версия';
        confirmText.textContent = 'Одобри';
        confirmButton.className = 'btn-primary';
    } else {
        modalTitle.innerHTML = '<i class="fas fa-times-circle"></i> Отхвърляне на версия';
        confirmText.textContent = 'Отхвърли';
        confirmButton.className = 'btn-danger';
    }
}

async function handleReviewConfirm() {
    const stored = localStorage.getItem('dms_pending_review');
    const pending = stored ? JSON.parse(stored) : null;
    if (!pending) return;

    const { action, versionId, versionNumber } = pending;
    const commentInput = document.getElementById('review-comment-input');
    const comment = commentInput ? commentInput.value.trim() : '';
    const documentId = getCurrentDocumentId();
    const documentTitle = getCurrentDocumentTitle();
    const button = document.getElementById('confirm-review-btn');
    const originalHtml = button ? button.innerHTML : '';

    if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span>';
    }

    try {
        if (action === 'approve') {
            await approveVersion(versionId, versionNumber, documentTitle, comment);
            showToast('Версията е одобрена', 'success');
        } else {
            await rejectVersion(versionId, versionNumber, documentTitle, comment);
            showToast('Версията е отхвърлена', 'warning');
        }
        localStorage.removeItem('dms_pending_review');
        delete window.DMSState.allVersionsData[documentId];
        window.location.href = 'versions.html';
    } catch (error) {
        showToast(error.message, 'error');
        if (button) {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }
    }
}

document.addEventListener('DOMContentLoaded', initReviewCommentPage);
