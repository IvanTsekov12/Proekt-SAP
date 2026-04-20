function initLoginPage() {
    const loginForm = document.querySelector('.login-form');
    if (!loginForm) return;

    if (isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', handleLogin);
}

async function handleLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username') || document.querySelector('input[type="text"]');
    const passwordInput = document.getElementById('password') || document.querySelector('input[type="password"]');
    const button = event.target.querySelector('button[type="submit"]');
    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!username || !password) {
        showToast(t('toast_fill_credentials'), 'warning');
        return;
    }

    if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span>';
    }

    try {
        await login(username, password);
        showToast(t('toast_login_success'), 'success');
        window.location.href = 'dashboard.html';
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        if (button) {
            button.disabled = false;
            button.innerHTML = `<span>${t('login_button')}</span><i class="fas fa-arrow-right"></i>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', initLoginPage);
