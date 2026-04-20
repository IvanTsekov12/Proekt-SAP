// ========================================
// DMS API Module
// Split from the original static 1.zip bundle
// ========================================

const API_BASE = 'http://localhost:8080';

function getAuthToken() {
    return localStorage.getItem('dms_auth');
}

function getCurrentUser() {
    return localStorage.getItem('dms_user') || 'user';
}

function saveAuth(username, password, role = 'USER') {
    const token = btoa(username + ':' + password);
    localStorage.setItem('dms_auth', token);
    localStorage.setItem('dms_user', username);
    localStorage.setItem('dms_role', role);
}

function getCurrentUserRole() {
    return localStorage.getItem('dms_role') || 'USER';
}

function isAdmin() {
    return getCurrentUserRole() === 'ADMIN';
}

function isAuthor() {
    return getCurrentUserRole() === 'AUTHOR';
}

function isReviewer() {
    return getCurrentUserRole() === 'REVIEWER';
}

function isReader() {
    return getCurrentUserRole() === 'READER';
}

function clearAuth() {
    localStorage.removeItem('dms_auth');
    localStorage.removeItem('dms_user');
    localStorage.removeItem('dms_role');
}

function isAuthenticated() {
    return !!getAuthToken();
}

async function api(endpoint, method = 'GET', body = null) {
    const token = getAuthToken();
    const options = {
        method,
        headers: {
            'Authorization': 'Basic ' + token,
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_BASE + endpoint, options);

    if (response.status === 401) {
        clearAuth();
        window.location.reload();
        throw new Error('Неоторизиран достъп');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Грешка при заявката' }));
        throw new Error(error.message || 'Грешка при заявката');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

async function login(username, password) {
    const token = btoa(username + ':' + password);
    const response = await fetch(API_BASE + '/documents', {
        headers: {
            'Authorization': 'Basic ' + token
        }
    });

    if (response.status === 401) {
        throw new Error('Невалидни потребителски данни');
    }

    if (!response.ok) {
        throw new Error('Грешка при свързване със сървъра');
    }

    let role = 'USER';
    const lowerUsername = username.toLowerCase();
    if (lowerUsername === 'admin') {
        role = 'ADMIN';
    } else if (lowerUsername === 'author') {
        role = 'AUTHOR';
    } else if (lowerUsername === 'reviewer') {
        role = 'REVIEWER';
    } else if (lowerUsername === 'reader') {
        role = 'READER';
    } else {
        const localUsers = getLocalUsers();
        const foundUser = localUsers.find((user) => user.username.toLowerCase() === lowerUsername);
        if (foundUser) {
            role = foundUser.role;
        }
    }

    saveAuth(username, password, role);
    addAuditLog('LOGIN', 'Влизане в системата', username, {
        eventType: 'login'
    });
    return true;
}

async function getDocuments() {
    return await api('/documents');
}

async function createDocument(title) {
    const result = await api('/documents', 'POST', { title });
    addAuditLog('CREATE', `Създаден документ: "${title}"`, getCurrentUser(), {
        eventType: 'document_created',
        documentId: result.id,
        documentTitle: title
    });
    return result;
}

async function deleteDocument(documentId, documentTitle) {
    const result = await api('/documents/' + documentId, 'DELETE');
    addAuditLog('DELETE', `Изтрит документ: "${documentTitle}"`, getCurrentUser(), {
        eventType: 'document_deleted',
        documentId,
        documentTitle
    });
    return result;
}

async function getVersions(documentId) {
    return await api('/documents/' + documentId + '/versions');
}

async function createVersion(documentId, content, documentTitle) {
    const result = await api('/documents/' + documentId + '/versions', 'POST', { content });
    addAuditLog('CREATE', `Създадена версия v${result.versionNumber} на документ: "${documentTitle}"`, getCurrentUser(), {
        eventType: 'version_created',
        documentId,
        documentTitle,
        versionId: result.id,
        versionNumber: result.versionNumber
    });
    return result;
}

async function submitForReview(versionId, versionNumber, documentTitle) {
    const result = await api('/documents/versions/' + versionId + '/submit', 'POST');
    addAuditLog('UPDATE', `Версия v${versionNumber} на "${documentTitle}" изпратена за преглед`, getCurrentUser(), {
        eventType: 'version_submitted',
        documentTitle,
        versionId,
        versionNumber
    });
    return result;
}

async function approveVersion(versionId, versionNumber, documentTitle, comment = '') {
    const body = comment ? { comment } : null;
    const result = await api('/documents/versions/' + versionId + '/approve', 'POST', body);
    let logDescription = `Одобрена версия v${versionNumber} на "${documentTitle}"`;
    if (comment) {
        logDescription += ` - Коментар: "${comment}"`;
    }
    addAuditLog('APPROVE', logDescription, getCurrentUser(), {
        eventType: 'version_approved',
        documentTitle,
        versionId,
        versionNumber,
        comment
    });
    return result;
}

async function rejectVersion(versionId, versionNumber, documentTitle, comment = '') {
    const body = comment ? { comment } : null;
    const result = await api('/documents/versions/' + versionId + '/reject', 'POST', body);
    let logDescription = `Отхвърлена версия v${versionNumber} на "${documentTitle}"`;
    if (comment) {
        logDescription += ` - Причина: "${comment}"`;
    }
    addAuditLog('REJECT', logDescription, getCurrentUser(), {
        eventType: 'version_rejected',
        documentTitle,
        versionId,
        versionNumber,
        comment
    });
    return result;
}

async function activateVersion(documentId, versionId, versionNumber, documentTitle) {
    const result = await api('/documents/' + documentId + '/versions/' + versionId + '/activate', 'POST');
    addAuditLog('UPDATE', `Активирана версия v${versionNumber} на "${documentTitle}"`, getCurrentUser(), {
        eventType: 'version_activated',
        documentId,
        documentTitle,
        versionId,
        versionNumber
    });
    return result;
}

async function getActiveVersion(documentId) {
    return await api('/documents/' + documentId + '/active');
}

async function getUsers() {
    try {
        return await api('/users');
    } catch (error) {
        return getLocalUsers();
    }
}

function getLocalUsers() {
    const storedUsers = localStorage.getItem('dms_users');
    if (storedUsers) {
        return JSON.parse(storedUsers);
    }

    const defaultUsers = [
        { id: '1', username: 'admin', role: 'ADMIN', status: 'online' },
        { id: '2', username: 'author', role: 'AUTHOR', status: 'online' },
        { id: '3', username: 'reviewer', role: 'REVIEWER', status: 'offline' },
        { id: '4', username: 'reader', role: 'READER', status: 'offline' }
    ];
    localStorage.setItem('dms_users', JSON.stringify(defaultUsers));
    return defaultUsers;
}

function saveLocalUsers(users) {
    localStorage.setItem('dms_users', JSON.stringify(users));
}

async function createUser(username, password, role) {
    try {
        return await api('/users', 'POST', { username, password, role });
    } catch (error) {
        const users = getLocalUsers();
        if (users.find((user) => user.username.toLowerCase() === username.toLowerCase())) {
            throw new Error('Потребител с това име вече съществува');
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            role,
            status: 'offline'
        };

        users.push(newUser);
        saveLocalUsers(users);
        addAuditLog('CREATE', `Създаден потребител: "${username}" с роля ${role}`, getCurrentUser(), {
            eventType: 'user_created',
            userId: newUser.id,
            username,
            role
        });
        return newUser;
    }
}

async function removeUser(userId) {
    try {
        return await api('/users/' + userId, 'DELETE');
    } catch (error) {
        const users = getLocalUsers();
        const userIndex = users.findIndex((user) => user.id === userId);
        if (userIndex === -1) {
            throw new Error('Потребителят не е намерен');
        }

        const deletedUser = users[userIndex];
        users.splice(userIndex, 1);
        saveLocalUsers(users);
        addAuditLog('DELETE', `Изтрит потребител: "${deletedUser.username}"`, getCurrentUser(), {
            eventType: 'user_deleted',
            userId,
            username: deletedUser.username
        });
        return true;
    }
}

function getAuditLogs() {
    const logs = localStorage.getItem('dms_audit_logs');
    return logs ? JSON.parse(logs) : [];
}

function addAuditLog(action, description, user, details = {}) {
    const logs = getAuditLogs();
    const newLog = {
        id: Date.now().toString(),
        action,
        description,
        user,
        timestamp: new Date().toISOString(),
        details
    };
    logs.unshift(newLog);
    if (logs.length > 100) {
        logs.pop();
    }
    localStorage.setItem('dms_audit_logs', JSON.stringify(logs));
    return newLog;
}

function clearAuditLogs() {
    localStorage.removeItem('dms_audit_logs');
}
