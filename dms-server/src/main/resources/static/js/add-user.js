function initAddUserPage() {
    const form = document.getElementById('add-user-form') || document.querySelector('form[action="index.html"]');
    if (!form) return;
    form.addEventListener('submit', handleAddUser);
}

async function handleAddUser(event) {
    event.preventDefault();
    const username = document.getElementById('new-username')?.value.trim() || '';
    const password = document.getElementById('new-password')?.value || '';
    const role = document.getElementById('new-role')?.value || 'READER';

    if (!username || !password) {
        showToast(t('add_user_fill_all'), 'warning');
        return;
    }

    try {
        await createUser(username, password, role);
        showToast(t('add_user_success', { username }), 'success');
        const form = document.getElementById('add-user-form');
        if (form) {
            form.reset();
        }
        window.location.href = 'index.html';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initAddUserPage);

window.refreshPageTranslations = initAddUserPage;
