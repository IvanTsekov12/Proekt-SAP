// ========================================
// DMS Shared Common UI
// ========================================

window.DMSState = window.DMSState || {
    currentDocumentId: localStorage.getItem('dms_current_document_id') || null,
    currentDocumentTitle: localStorage.getItem('dms_current_document_title') || '',
    allDocuments: [],
    allVersionsData: {},
    deleteDocumentId: null,
    deleteDocumentName: '',
    currentTheme: localStorage.getItem('dms_theme') || 'dark',
    pendingReviewAction: null,
    language: localStorage.getItem('dms_lang') || 'bg'
};

const TRANSLATIONS = {
    bg: {
        nav_dashboard: 'Табло',
        nav_documents: 'Документи',
        nav_users: 'Потребители',
        nav_audit: 'История',
        logout_aria: 'Изход',
        lang_toggle: 'EN',
        theme_label: 'Тема',
        theme_dark: 'Тъмна',
        theme_light: 'Светла',
        login_title: 'DMS - Вход',
        login_username_placeholder: 'Потребителско име',
        login_password_placeholder: 'Парола',
        login_button: 'Вход',
        login_demo: 'Демо акаунти: author / reviewer / admin',
        login_create_account: 'Създай акаунт',
        add_user_title: 'DMS - Нов потребител',
        add_user_heading: 'Нов потребител',
        add_user_username: 'Потребителско име',
        add_user_username_placeholder: 'Въведете потребителско име...',
        add_user_password: 'Парола',
        add_user_password_placeholder: 'Въведете парола...',
        add_user_role: 'Роля',
        add_user_role_reader: 'Reader - Само четене',
        add_user_role_author: 'Author - Създаване на документи',
        add_user_role_reviewer: 'Reviewer - Одобрение на версии',
        add_user_role_admin: 'Admin - Пълен достъп',
        add_user_cancel: 'Отказ',
        add_user_submit: 'Създай',
        add_user_fill_all: 'Моля попълнете всички полета',
        add_user_success: 'Потребител "{username}" е създаден успешно!',
        create_document_title: 'DMS - Нов документ',
        create_document_heading: 'Нов документ',
        create_document_label_title: 'Заглавие на документа',
        create_document_placeholder_title: 'Въведете заглавие...',
        create_document_label_content: 'Съдържание на документа',
        create_document_placeholder_content: 'Добавете начално съдържание на документа...',
        create_document_cancel: 'Отказ',
        create_document_submit: 'Създай',
        create_document_success_review: 'Документът и версия 1 са създадени и изпратени за преглед!',
        create_document_success: 'Документът и версия 1 са създадени успешно!',
        create_version_title: 'DMS - Нова версия',
        create_version_heading: 'Нова версия',
        create_version_label_content: 'Съдържание на версията',
        create_version_placeholder_content: 'Въведете съдържание...',
        create_version_hint: 'Заредено е текущото съдържание на документа, което можете да редактирате.',
        create_version_cancel: 'Отказ',
        create_version_submit: 'Създай версия',
        create_version_success_review: 'Версията е създадена и изпратена за преглед!',
        create_version_success: 'Версията е създадена успешно!',
        create_version_rejected_first: 'Не можете да създавате нови версии, когато първата версия е отхвърлена',
        dashboard_title: 'DMS - Табло',
        dashboard_heading: 'Табло',
        dashboard_subtitle: 'Преглед на статистики',
        stat_total_docs: 'Общо документи',
        stat_total_versions: 'Общо версии',
        stat_pending_review: 'Чакат преглед',
        stat_approved: 'Одобрени',
        chart_versions_by_status: 'Версии по статус',
        recent_documents: 'Последни документи',
        pending_approval: 'Чакащи одобрение',
        recent_activity: 'Последна активност',
        quick_actions: 'Бързи действия',
        quick_new_document: 'Нов документ',
        quick_view_documents: 'Виж документи',
        quick_users: 'Потребители',
        quick_full_history: 'Пълна история',
        documents_title: 'DMS - Документи',
        documents_heading: 'Документи',
        documents_subtitle: 'Управление на документи и версии',
        search_placeholder: 'Търсене...',
        new_document: 'Нов документ',
        section_approved: 'Одобрени',
        section_rejected: 'Отхвърлени',
        section_review: 'В преглед',
        no_approved_documents: 'Няма одобрени документи',
        no_rejected_documents: 'Няма отхвърлени документи',
        no_review_documents: 'Няма документи в преглед',
        versions_title: 'DMS - Версии',
        versions_subtitle: 'Версии на документа',
        compare_button: 'Сравни',
        export_button: 'Експорт',
        new_version: 'Нова версия',
        export_page_title: 'DMS - Експорт',
        export_modal_title: 'Експорт на документ',
        export_version_title: 'Експорт на версия v{version}',
        export_edit_label: 'Редактирайте съдържанието преди експорт:',
        export_download_txt: 'Изтегли TXT',
        export_download_pdf: 'Изтегли PDF',
        export_not_allowed_rejected: 'Експортът не е позволен, когато първата версия е отхвърлена',
        export_no_content: 'Няма съдържание за експорт',
        export_success: 'Документът е експортиран като {format}',
        export_generated_at: 'Експортиран на:',
        export_version_label: 'Версия {version}',
        export_unknown: 'Неизвестен',
        users_title: 'DMS - Потребители',
        users_heading: 'Потребители',
        users_subtitle: 'Управление на потребители',
        users_col_user: 'Потребител',
        users_col_role: 'Роля',
        users_col_status: 'Статус',
        users_col_actions: 'Действия',
        audit_title: 'DMS - История',
        audit_heading: 'История на действията',
        audit_subtitle: 'Преглед на всички действия в системата',
        filter_all: 'Всички действия',
        filter_create: 'Създаване',
        filter_update: 'Промяна',
        filter_delete: 'Изтриване',
        filter_approve: 'Одобрение',
        compare_page_title: 'DMS - Сравнение',
        compare_heading: 'Сравнение на версии',
        compare_doc_subtitle: 'Изберете документ',
        compare_version_1: 'Версия 1:',
        compare_version_2: 'Версия 2:',
        compare_select_version: 'Изберете версия',
        compare_run: 'Сравни',
        compare_empty_title: 'Няма избрано сравнение',
        compare_empty_message: 'Изберете две версии и натиснете "Сравни"',
        status_draft: 'Чернова',
        status_in_review: 'В преглед',
        status_approved: 'Одобрена',
        status_rejected: 'Отхвърлена',
        status_active: 'Активна',
        toast_no_documents: 'Няма документи',
        toast_no_pending_versions: 'Няма чакащи версии',
        toast_no_activity: 'Няма активност',
        toast_version_approved: 'Версията е одобрена',
        toast_version_rejected: 'Версията е отхвърлена',
        no_search_results: 'Няма резултати за "{query}"',
        try_other_search: 'Опитайте с друго търсене',
        version_count_one: 'версия',
        version_count_many: 'версии',
        versions_empty_title: 'Няма версии',
        versions_empty_message: 'Създайте първата версия на документа',
        no_content: 'Няма съдържание',
        action_view: 'Преглед',
        action_export: 'Експорт',
        action_approve: 'Одобри',
        action_reject: 'Отхвърли',
        action_activate: 'Активирай',
        version_not_found: 'Версията не е намерена',
        unknown_user: 'Неизвестен',
        no_users: 'Няма потребители',
        load_error: 'Грешка при зареждане',
        online: 'Онлайн',
        offline: 'Офлайн',
        only_admin_delete_users: 'Само администратори могат да изтриват потребители',
        confirm_delete_user: 'Сигурни ли сте, че искате да изтриете потребител "{username}"?',
        user_deleted: 'Потребител "{username}" е изтрит',
        no_records: 'Няма записи',
        audit_empty: 'Историята на действията е празна',
        action_login: 'Влизане',
        action_export: 'Експорт',
        audit_login_description: 'Влизане в системата',
        audit_document_created: 'Създаден документ: "{title}"',
        audit_document_deleted: 'Изтрит документ: "{title}"',
        audit_version_created: 'Създадена версия v{version} на документ: "{title}"',
        audit_version_submitted: 'Версия v{version} на "{title}" изпратена за преглед',
        audit_version_approved: 'Одобрена версия v{version} на "{title}"',
        audit_version_rejected: 'Отхвърлена версия v{version} на "{title}"',
        audit_version_activated: 'Активирана версия v{version} на "{title}"',
        audit_user_created: 'Създаден потребител: "{username}" с роля {role}',
        audit_user_deleted: 'Изтрит потребител: "{username}"',
        audit_document_exported: 'Експортиран документ: "{title}"{versionSuffix} като {format}',
        audit_comment_suffix: ' - Коментар: "{comment}"',
        audit_reason_suffix: ' - Причина: "{comment}"',
        audit_version_suffix: ' (v{version})',
        compare_missing_document: 'Не е избран документ',
        compare_missing_document_message: 'Изберете документ и отворете сравнението от страницата с версиите.',
        compare_not_enough_versions: 'Недостатъчно версии',
        compare_not_enough_versions_message: 'Необходими са поне 2 версии за сравнение.',
        compare_choose_versions: 'Изберете първа и втора версия за сравнение',
        compare_choose_different: 'Изберете различни версии',
        compare_no_differences: 'Няма разлики',
        compare_between_versions: 'Разлики между v{first} и v{second}',
        compare_version_label: 'Версия {number}',
        compare_no_newer_version: 'Няма по-нова версия за сравнение',
        time_just_now: 'преди момент',
        time_minutes_ago: 'преди {count} мин',
        time_hours_ago: 'преди {count} ч',
        time_days_ago: 'преди {count} дни'
    },
    en: {
        nav_dashboard: 'Dashboard',
        nav_documents: 'Documents',
        nav_users: 'Users',
        nav_audit: 'History',
        logout_aria: 'Logout',
        lang_toggle: 'BG',
        theme_label: 'Theme',
        theme_dark: 'Dark',
        theme_light: 'Light',
        login_title: 'DMS - Login',
        login_username_placeholder: 'Username',
        login_password_placeholder: 'Password',
        login_button: 'Login',
        login_demo: 'Demo accounts: author / reviewer / admin',
        login_create_account: 'Create account',
        add_user_title: 'DMS - New user',
        add_user_heading: 'New user',
        add_user_username: 'Username',
        add_user_username_placeholder: 'Enter username...',
        add_user_password: 'Password',
        add_user_password_placeholder: 'Enter password...',
        add_user_role: 'Role',
        add_user_role_reader: 'Reader - Read only',
        add_user_role_author: 'Author - Create documents',
        add_user_role_reviewer: 'Reviewer - Approve versions',
        add_user_role_admin: 'Admin - Full access',
        add_user_cancel: 'Cancel',
        add_user_submit: 'Create',
        add_user_fill_all: 'Please fill in all fields',
        add_user_success: 'User "{username}" was created successfully!',
        create_document_title: 'DMS - New document',
        create_document_heading: 'New document',
        create_document_label_title: 'Document title',
        create_document_placeholder_title: 'Enter title...',
        create_document_label_content: 'Document content',
        create_document_placeholder_content: 'Add initial document content...',
        create_document_cancel: 'Cancel',
        create_document_submit: 'Create',
        create_document_success_review: 'The document and version 1 were created and sent for review!',
        create_document_success: 'The document and version 1 were created successfully!',
        create_version_title: 'DMS - New version',
        create_version_heading: 'New version',
        create_version_label_content: 'Version content',
        create_version_placeholder_content: 'Enter content...',
        create_version_hint: 'The current document content is loaded and ready for editing.',
        create_version_cancel: 'Cancel',
        create_version_submit: 'Create version',
        create_version_success_review: 'The version was created and sent for review!',
        create_version_success: 'The version was created successfully!',
        create_version_rejected_first: 'You cannot create new versions when the first version is rejected',
        dashboard_title: 'DMS - Dashboard',
        dashboard_heading: 'Dashboard',
        dashboard_subtitle: 'Statistics overview',
        stat_total_docs: 'Total documents',
        stat_total_versions: 'Total versions',
        stat_pending_review: 'Pending review',
        stat_approved: 'Approved',
        chart_versions_by_status: 'Versions by status',
        recent_documents: 'Recent documents',
        pending_approval: 'Pending approval',
        recent_activity: 'Recent activity',
        quick_actions: 'Quick actions',
        quick_new_document: 'New document',
        quick_view_documents: 'View documents',
        quick_users: 'Users',
        quick_full_history: 'Full history',
        documents_title: 'DMS - Documents',
        documents_heading: 'Documents',
        documents_subtitle: 'Manage documents and versions',
        search_placeholder: 'Search...',
        new_document: 'New document',
        section_approved: 'Approved',
        section_rejected: 'Rejected',
        section_review: 'In review',
        no_approved_documents: 'No approved documents',
        no_rejected_documents: 'No rejected documents',
        no_review_documents: 'No documents in review',
        versions_title: 'DMS - Versions',
        versions_subtitle: 'Document versions',
        compare_button: 'Compare',
        export_button: 'Export',
        new_version: 'New version',
        export_page_title: 'DMS - Export',
        export_modal_title: 'Export document',
        export_version_title: 'Export version v{version}',
        export_edit_label: 'Edit the content before export:',
        export_download_txt: 'Download TXT',
        export_download_pdf: 'Download PDF',
        export_not_allowed_rejected: 'Export is not allowed when the first version is rejected',
        export_no_content: 'No content to export',
        export_success: 'The document was exported as {format}',
        export_generated_at: 'Exported on:',
        export_version_label: 'Version {version}',
        export_unknown: 'Unknown',
        users_title: 'DMS - Users',
        users_heading: 'Users',
        users_subtitle: 'Manage users',
        users_col_user: 'User',
        users_col_role: 'Role',
        users_col_status: 'Status',
        users_col_actions: 'Actions',
        audit_title: 'DMS - History',
        audit_heading: 'Action history',
        audit_subtitle: 'Review all actions in the system',
        filter_all: 'All actions',
        filter_create: 'Create',
        filter_update: 'Update',
        filter_delete: 'Delete',
        filter_approve: 'Approve',
        compare_page_title: 'DMS - Compare',
        compare_heading: 'Compare versions',
        compare_doc_subtitle: 'Select a document',
        compare_version_1: 'Version 1:',
        compare_version_2: 'Version 2:',
        compare_select_version: 'Select version',
        compare_run: 'Compare',
        compare_empty_title: 'No comparison selected',
        compare_empty_message: 'Choose two versions and press "Compare"',
        status_draft: 'Draft',
        status_in_review: 'In review',
        status_approved: 'Approved',
        status_rejected: 'Rejected',
        status_active: 'Active',
        toast_no_documents: 'No documents',
        toast_no_pending_versions: 'No pending versions',
        toast_no_activity: 'No activity',
        toast_version_approved: 'The version was approved',
        toast_version_rejected: 'The version was rejected',
        no_search_results: 'No results for "{query}"',
        try_other_search: 'Try a different search',
        version_count_one: 'version',
        version_count_many: 'versions',
        versions_empty_title: 'No versions',
        versions_empty_message: 'Create the first version of the document',
        no_content: 'No content',
        action_view: 'View',
        action_export: 'Export',
        action_approve: 'Approve',
        action_reject: 'Reject',
        action_activate: 'Activate',
        version_not_found: 'Version not found',
        unknown_user: 'Unknown',
        no_users: 'No users',
        load_error: 'Loading error',
        online: 'Online',
        offline: 'Offline',
        only_admin_delete_users: 'Only administrators can delete users',
        confirm_delete_user: 'Are you sure you want to delete user "{username}"?',
        user_deleted: 'User "{username}" was deleted',
        no_records: 'No records',
        audit_empty: 'The action history is empty',
        action_login: 'Login',
        action_export: 'Export',
        audit_login_description: 'Logged into the system',
        audit_document_created: 'Created document: "{title}"',
        audit_document_deleted: 'Deleted document: "{title}"',
        audit_version_created: 'Created version v{version} of document: "{title}"',
        audit_version_submitted: 'Submitted version v{version} of "{title}" for review',
        audit_version_approved: 'Approved version v{version} of "{title}"',
        audit_version_rejected: 'Rejected version v{version} of "{title}"',
        audit_version_activated: 'Activated version v{version} of "{title}"',
        audit_user_created: 'Created user: "{username}" with role {role}',
        audit_user_deleted: 'Deleted user: "{username}"',
        audit_document_exported: 'Exported document: "{title}"{versionSuffix} as {format}',
        audit_comment_suffix: ' - Comment: "{comment}"',
        audit_reason_suffix: ' - Reason: "{comment}"',
        audit_version_suffix: ' (v{version})',
        compare_missing_document: 'No document selected',
        compare_missing_document_message: 'Select a document and open comparison from the versions page.',
        compare_not_enough_versions: 'Not enough versions',
        compare_not_enough_versions_message: 'At least 2 versions are required for comparison.',
        compare_choose_versions: 'Select a first and second version to compare',
        compare_choose_different: 'Choose different versions',
        compare_no_differences: 'No differences',
        compare_between_versions: 'Differences between v{first} and v{second}',
        compare_version_label: 'Version {number}',
        compare_no_newer_version: 'There is no newer version to compare',
        time_just_now: 'just now',
        time_minutes_ago: '{count} min ago',
        time_hours_ago: '{count} h ago',
        time_days_ago: '{count} days ago'
    }
};

function getLanguage() {
    return window.DMSState.language || localStorage.getItem('dms_lang') || 'bg';
}

function setLanguage(language) {
    window.DMSState.language = language;
    localStorage.setItem('dms_lang', language);
    document.documentElement.lang = language === 'bg' ? 'bg' : 'en';
}

function t(key, vars = {}) {
    const language = getLanguage();
    const catalog = TRANSLATIONS[language] || TRANSLATIONS.bg;
    const fallback = TRANSLATIONS.bg[key] || key;
    const template = catalog[key] || fallback;

    return Object.entries(vars).reduce((result, [name, value]) => (
        result.replaceAll(`{${name}}`, String(value))
    ), template);
}

function setCurrentDocument(documentId, title) {
    window.DMSState.currentDocumentId = documentId;
    window.DMSState.currentDocumentTitle = title || '';
    localStorage.setItem('dms_current_document_id', documentId || '');
    localStorage.setItem('dms_current_document_title', title || '');
}

function getCurrentDocumentId() {
    return window.DMSState.currentDocumentId || localStorage.getItem('dms_current_document_id') || null;
}

function getCurrentDocumentTitle() {
    return window.DMSState.currentDocumentTitle || localStorage.getItem('dms_current_document_title') || '';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    window.DMSState.currentTheme = theme;
    localStorage.setItem('dms_theme', theme);

    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

function toggleTheme() {
    const currentTheme = window.DMSState.currentTheme || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    showToast(`${t('theme_label')}: ${nextTheme === 'dark' ? t('theme_dark') : t('theme_light')}`, 'info');
}

function renderSidebar() {
    const sidebar = document.getElementById('sidebar-root');
    if (!sidebar) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = [
        { href: 'dashboard.html', icon: 'fas fa-chart-pie', label: t('nav_dashboard'), pages: ['dashboard.html'] },
        { href: 'documents.html', icon: 'fas fa-folder', label: t('nav_documents'), pages: ['documents.html', 'versions.html', 'compare.html'] },
        { href: 'users.html', icon: 'fas fa-users', label: t('nav_users'), pages: ['users.html'] },
        { href: 'audit.html', icon: 'fas fa-history', label: t('nav_audit'), pages: ['audit.html'] }
    ];

    sidebar.innerHTML = `
        <div class="sidebar-header">
            <div class="logo"><i class="fas fa-file-alt"></i><span>DMS</span></div>
            <button id="language-toggle" class="language-toggle" type="button">${t('lang_toggle')}</button>
        </div>
        <nav class="sidebar-nav">
            ${navItems.map((item) => `
                <a href="${item.href}" class="nav-item ${item.pages.includes(currentPage) ? 'active' : ''}">
                    <i class="${item.icon}"></i><span>${item.label}</span>
                </a>
            `).join('')}
        </nav>
        <div class="sidebar-footer">
            <div class="user-info">
                <div class="user-avatar"><i class="fas fa-user"></i></div>
                <div class="user-details">
                    <span>${escapeHtml(getCurrentUser())}</span>
                    <span class="role-badge">${escapeHtml(getCurrentUserRole())}</span>
                </div>
            </div>
            <a href="index.html" class="btn-logout" aria-label="${t('logout_aria')}"><i class="fas fa-sign-out-alt"></i></a>
        </div>
    `;
}

function renderStandaloneLanguageToggle() {
    const container = document.getElementById('language-toggle-root');
    if (!container) return;

    container.innerHTML = `
        <button id="language-toggle" class="language-toggle standalone" type="button">${t('lang_toggle')}</button>
    `;
}

function bindLanguageToggle() {
    const toggle = document.getElementById('language-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const nextLanguage = getLanguage() === 'bg' ? 'en' : 'bg';
        setLanguage(nextLanguage);
        initSharedUI();
        if (typeof window.refreshPageTranslations === 'function') {
            window.refreshPageTranslations();
        }
    });
}

function applyTranslations() {
    document.documentElement.lang = getLanguage() === 'bg' ? 'bg' : 'en';

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
        element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
    });
}

function initSharedUI() {
    renderSidebar();
    renderStandaloneLanguageToggle();
    applyTranslations();
    applyTheme(window.DMSState.currentTheme || 'dark');
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    bindLanguageToggle();
    syncCurrentUserUI();
    applyRolePermissions();
    bindLogoutButtons();
}

function syncCurrentUserUI() {
    const username = getCurrentUser();
    const role = getCurrentUserRole();

    document.querySelectorAll('.user-details').forEach((details) => {
        const spans = details.querySelectorAll('span');
        if (spans[0]) spans[0].textContent = username;
        if (spans[1]) spans[1].textContent = role;
    });
}

function hideElements(selectors) {
    selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
            element.style.display = 'none';
        });
    });
}

function redirectIfUnauthorized(currentPage) {
    if ((currentPage === 'users.html' || currentPage === 'add-user.html') && !isAdmin()) {
        window.location.href = 'documents.html';
        return true;
    }

    if (currentPage === 'audit.html' && !(isAdmin() || isAuthor())) {
        window.location.href = 'documents.html';
        return true;
    }

    if (currentPage === 'delete-document.html' && !(isAuthor() || isAdmin())) {
        window.location.href = 'documents.html';
        return true;
    }

    if (currentPage === 'create-document.html' && !(isAuthor() || isAdmin())) {
        window.location.href = 'documents.html';
        return true;
    }

    if (currentPage === 'create-version.html' && !(isAuthor() || isAdmin())) {
        window.location.href = 'versions.html';
        return true;
    }

    if (currentPage === 'review-comment.html' && !(isReviewer() || isAdmin())) {
        window.location.href = 'versions.html';
        return true;
    }

    if ((currentPage === 'compare.html' || currentPage === 'export-document.html') && !(isAuthor() || isAdmin())) {
        window.location.href = 'versions.html';
        return true;
    }

    return false;
}

function applyRolePermissions() {
    if (!isAuthenticated()) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (redirectIfUnauthorized(currentPage)) return;

    if (!isAdmin()) {
        hideElements([
            '.sidebar-nav a[href="users.html"]',
            '.quick-action-btn[href="users.html"]',
        ]);
    }

    if (!(isAdmin() || isAuthor())) {
        hideElements([
            '.sidebar-nav a[href="audit.html"]',
            '.quick-action-btn[href="audit.html"]'
        ]);
    }

    if (!(isAuthor() || isAdmin())) {
        hideElements([
            '.header-actions a[href="create-document.html"]',
            '.quick-action-btn[href="create-document.html"]',
            '.header-actions a[href="create-version.html"]'
        ]);
    }

    if (isReader() || isReviewer()) {
        hideElements([
            '.header-actions a[href="compare.html"]',
            '.header-actions a[href="export-document.html"]'
        ]);
    }
}

function bindLogoutButtons() {
    document.querySelectorAll('.btn-logout').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            clearAuth();
            setCurrentDocument(null, '');
            localStorage.removeItem('dms_pending_review');
            localStorage.removeItem('dms_view_version_id');
            localStorage.removeItem('dms_export_version_id');
            localStorage.removeItem('dms_delete_document_id');
            localStorage.removeItem('dms_delete_document_title');
            window.location.href = 'index.html';
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach((modal) => {
        modal.classList.remove('active');
    });
    window.DMSState.pendingReviewAction = null;
    const reviewCommentInput = document.getElementById('review-comment-input');
    if (reviewCommentInput) {
        reviewCommentInput.value = '';
    }
}

function bindModalCloseHandlers() {
    document.querySelectorAll('.modal-close, .modal-cancel, .modal-overlay').forEach((element) => {
        element.addEventListener('click', (event) => {
            if (
                event.target.classList.contains('modal-overlay') ||
                event.target.classList.contains('modal-close') ||
                event.target.classList.contains('modal-cancel')
            ) {
                closeAllModals();
            }
        });
    });
}

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${escapeHtml(message)}</span>
        <button class="toast-close" type="button"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);

    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => toast.remove());
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(getLanguage() === 'bg' ? 'bg-BG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(getLanguage() === 'bg' ? 'bg-BG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return t('time_just_now');
    if (diff < 3600) return t('time_minutes_ago', { count: Math.floor(diff / 60) });
    if (diff < 86400) return t('time_hours_ago', { count: Math.floor(diff / 3600) });
    if (diff < 604800) return t('time_days_ago', { count: Math.floor(diff / 86400) });
    return formatDate(dateString);
}

function getStatusText(status) {
    const statusMap = {
        DRAFT: t('status_draft'),
        IN_REVIEW: t('status_in_review'),
        APPROVED: t('status_approved'),
        REJECTED: t('status_rejected'),
        ACTIVE: t('status_active')
    };
    return statusMap[status] || status;
}

document.addEventListener('DOMContentLoaded', () => {
    initSharedUI();
    bindModalCloseHandlers();
});
