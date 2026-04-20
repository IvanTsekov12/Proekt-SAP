function initDocumentsPage() {
    const documentsSections = document.getElementById('documents-sections');
    if (!documentsSections) return;

    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');

    loadDocuments();

    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (clearSearchBtn) clearSearchBtn.addEventListener('click', clearSearch);
}

async function loadDocuments() {
    const documentsSections = document.getElementById('documents-sections');
    if (!documentsSections) return;
    ['approved-documents', 'rejected-documents', 'review-documents'].forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
            section.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        }
    });

    try {
        const documents = await getDocuments();
        const documentsWithStatus = await enrichDocumentsWithStatus(documents || []);
        window.DMSState.allDocuments = documentsWithStatus;
        renderDocuments(window.DMSState.allDocuments);
    } catch (error) {
        showToast(error.message, 'error');
        ['approved-documents', 'rejected-documents', 'review-documents'].forEach((id) => {
            const section = document.getElementById(id);
            if (section) {
                section.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Грешка при зареждане</h3>
                        <p>${escapeHtml(error.message)}</p>
                    </div>
                `;
            }
        });
    }
}

async function enrichDocumentsWithStatus(documents) {
    const enriched = await Promise.all(documents.map(async (doc) => {
        try {
            const versions = await getVersions(doc.id);
            const derivedStatus = deriveDocumentStatus(versions || []);
            return {
                ...doc,
                versionsCount: (versions || []).length,
                derivedStatus
            };
        } catch (error) {
            return {
                ...doc,
                versionsCount: 0,
                derivedStatus: 'IN_REVIEW'
            };
        }
    }));

    return enriched;
}

function deriveDocumentStatus(versions) {
    if (!versions || versions.length === 0) {
        return 'IN_REVIEW';
    }

    const latestVersion = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
    if (!latestVersion) {
        return 'IN_REVIEW';
    }

    if (latestVersion.status === 'ACTIVE' || latestVersion.status === 'APPROVED') {
        return 'APPROVED';
    }

    if (latestVersion.status === 'REJECTED') {
        return 'REJECTED';
    }

    return 'IN_REVIEW';
}

function renderDocuments(documents, searchQuery = '') {
    const approvedGrid = document.getElementById('approved-documents');
    const rejectedGrid = document.getElementById('rejected-documents');
    const reviewGrid = document.getElementById('review-documents');
    if (!approvedGrid || !rejectedGrid || !reviewGrid) return;
    const canDeleteDocuments = isAdmin() || isAuthor();

    if (!documents || documents.length === 0) {
        const emptyHtml = searchQuery ? `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>${escapeHtml(t('no_search_results', { query: searchQuery }))}</h3>
                <p>${escapeHtml(t('try_other_search'))}</p>
            </div>
        ` : '';
        approvedGrid.innerHTML = emptyHtml;
        rejectedGrid.innerHTML = emptyHtml;
        reviewGrid.innerHTML = emptyHtml;

        if (!searchQuery) {
            approvedGrid.innerHTML = renderSectionEmpty('approved');
            rejectedGrid.innerHTML = renderSectionEmpty('rejected');
            reviewGrid.innerHTML = renderSectionEmpty('review');
        }

        updateSectionCounts([], [], []);
        return;
    }

    const approvedDocuments = documents.filter((doc) => doc.derivedStatus === 'APPROVED');
    const rejectedDocuments = documents.filter((doc) => doc.derivedStatus === 'REJECTED');
    const reviewDocuments = documents.filter((doc) => doc.derivedStatus === 'IN_REVIEW');

    approvedGrid.innerHTML = renderDocumentCards(approvedDocuments, searchQuery, canDeleteDocuments);
    rejectedGrid.innerHTML = renderDocumentCards(rejectedDocuments, searchQuery, canDeleteDocuments);
    reviewGrid.innerHTML = renderDocumentCards(reviewDocuments, searchQuery, canDeleteDocuments);

    if (!approvedDocuments.length) {
        approvedGrid.innerHTML = renderSectionEmpty('approved');
    }
    if (!rejectedDocuments.length) {
        rejectedGrid.innerHTML = renderSectionEmpty('rejected');
    }
    if (!reviewDocuments.length) {
        reviewGrid.innerHTML = renderSectionEmpty('review');
    }

    updateSectionCounts(approvedDocuments, rejectedDocuments, reviewDocuments);

    document.querySelectorAll('.document-card').forEach((card) => {
        card.addEventListener('click', (event) => {
            if (event.target.closest('[data-delete-doc-id]')) return;
            setCurrentDocument(card.dataset.id, card.dataset.title);
            window.location.href = 'versions.html';
        });
    });

    document.querySelectorAll('[data-delete-doc-id]').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            openDeleteModal(button.dataset.deleteDocId, button.dataset.deleteDocTitle);
        });
    });
}

function renderDocumentCards(documents, searchQuery, canDeleteDocuments) {
    return documents.map((doc, index) => `
        <div class="document-card" data-id="${doc.id}" data-title="${escapeHtml(doc.title)}" style="animation-delay: ${index * 0.05}s">
            <div class="card-header">
                <div class="card-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="card-actions">
                    ${canDeleteDocuments ? `
                    <button class="btn-icon delete" type="button" data-delete-doc-id="${doc.id}" data-delete-doc-title="${escapeHtml(doc.title)}" title="Изтрий">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
            <div class="document-card-header">
                <h3>${highlightText(doc.title, searchQuery)}</h3>
            </div>
            <div class="card-meta">
                <span><i class="fas fa-calendar"></i> ${formatDate(doc.createdAt)}</span>
                <span><i class="fas fa-code-branch"></i> ${doc.versionsCount || 0} ${getVersionCountLabel(doc.versionsCount || 0)}</span>
            </div>
        </div>
    `).join('');
}

function renderSectionEmpty(type) {
    const config = {
        approved: {
            title: 'Няма одобрени документи',
            titleKey: 'no_approved_documents',
            className: 'approved'
        },
        rejected: {
            title: 'Няма отхвърлени документи',
            titleKey: 'no_rejected_documents',
            className: 'rejected'
        },
        review: {
            title: 'Няма документи в преглед',
            titleKey: 'no_review_documents',
            className: 'review'
        }
    };

    const section = config[type];
    if (!section) return '';

    return `
        <div class="section-empty-card ${section.className}">
            <div class="section-empty-text">${t(section.titleKey)}</div>
        </div>
    `;
}

function getVersionCountLabel(count) {
    return count === 1 ? t('version_count_one') : t('version_count_many');
}

function updateSectionCounts(approvedDocuments, rejectedDocuments, reviewDocuments) {
    const approvedCount = document.getElementById('approved-count');
    const rejectedCount = document.getElementById('rejected-count');
    const reviewCount = document.getElementById('review-count');

    if (approvedCount) approvedCount.textContent = approvedDocuments.length;
    if (rejectedCount) rejectedCount.textContent = rejectedDocuments.length;
    if (reviewCount) reviewCount.textContent = reviewDocuments.length;
}

function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark style="background: var(--accent-primary); color: white; padding: 0 2px; border-radius: 2px;">$1</mark>');
}

function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase().trim();
    if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('hidden', !query);
    }
    if (!query) {
        renderDocuments(window.DMSState.allDocuments);
        return;
    }
    const filtered = window.DMSState.allDocuments.filter((doc) => doc.title.toLowerCase().includes(query));
    renderDocuments(filtered, query);
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
    renderDocuments(window.DMSState.allDocuments);
}

function openDeleteModal(docId, docTitle) {
    window.DMSState.deleteDocumentId = docId;
    window.DMSState.deleteDocumentName = docTitle;
    localStorage.setItem('dms_delete_document_id', docId);
    localStorage.setItem('dms_delete_document_title', docTitle);
    window.location.href = 'delete-document.html';
}

document.addEventListener('DOMContentLoaded', initDocumentsPage);

window.refreshPageTranslations = initDocumentsPage;
