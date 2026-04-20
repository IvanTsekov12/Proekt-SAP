function initUsersPage() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    loadUsers();
}

async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4"><div class="loading"><div class="spinner"></div></div></td></tr>';

    try {
        const users = await getUsers();
        renderUsers(users);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t('load_error')}</td></tr>`;
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    const admin = isAdmin();

    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${admin ? 4 : 3}" class="empty-state">${t('no_users')}</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map((user) => `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="avatar"><i class="fas fa-user"></i></div>
                    <span>${escapeHtml(user.username)}</span>
                </div>
            </td>
            <td><span class="role-tag ${user.role.toLowerCase()}">${user.role}</span></td>
            <td>
                <div class="status-indicator">
                    <span class="status-dot ${user.status === 'online' ? '' : 'offline'}"></span>
                    <span>${user.status === 'online' ? t('online') : t('offline')}</span>
                </div>
            </td>
            ${admin ? `
            <td>
                <div class="user-actions">
                    <button class="btn-delete-user" type="button" data-user-id="${user.id}" data-username="${escapeHtml(user.username)}" title="Изтрий">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
            ` : ''}
        </tr>
    `).join('');

    tbody.querySelectorAll('.btn-delete-user').forEach((button) => {
        button.addEventListener('click', () => deleteUser(button.dataset.userId, button.dataset.username));
    });
}

async function deleteUser(userId, username) {
    if (!isAdmin()) {
        showToast(t('only_admin_delete_users'), 'error');
        return;
    }

    if (!confirm(t('confirm_delete_user', { username }))) {
        return;
    }

    try {
        await removeUser(userId);
        showToast(t('user_deleted', { username }), 'success');
        loadUsers();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initUsersPage();
});

window.refreshPageTranslations = initUsersPage;
