function initComparePage() {
    const compareResult = document.getElementById('compare-result');
    if (!compareResult) return;

    const documentId = getCurrentDocumentId();
    const documentTitle = getCurrentDocumentTitle();
    const title = document.getElementById('compare-doc-title');
    if (title && documentTitle) {
        title.textContent = documentTitle;
    }

    if (!documentId) {
        renderCompareState(t('compare_missing_document'), t('compare_missing_document_message'));
        return;
    }

    getVersions(documentId).then((versions) => {
        window.DMSState.allVersionsData[documentId] = versions || [];
        populateCompareSelectors(versions || []);
    }).catch((error) => showToast(error.message, 'error'));

    const compareButton = document.getElementById('run-compare-btn');
    if (compareButton) {
        compareButton.addEventListener('click', runComparison);
    }

    const firstVersionSelect = document.getElementById('compare-version-1');
    if (firstVersionSelect) {
        firstVersionSelect.addEventListener('change', handleFirstVersionChange);
    }
}

function populateCompareSelectors(versions) {
    const select1 = document.getElementById('compare-version-1');
    const select2 = document.getElementById('compare-version-2');
    if (!select1 || !select2) return;
    if (!versions || versions.length < 2) {
        renderCompareState(t('compare_not_enough_versions'), t('compare_not_enough_versions_message'));
        return;
    }

    const sortedVersions = [...versions].sort((first, second) => first.versionNumber - second.versionNumber);
    window.DMSState.compareVersions = sortedVersions;

    select1.innerHTML = buildCompareOptions(sortedVersions, '');
    select2.innerHTML = buildCompareOptions([], '');
    select1.value = '';
    select2.value = '';
    select2.disabled = true;
}

function runComparison() {
    const documentId = getCurrentDocumentId();
    const versions = window.DMSState.allVersionsData[documentId] || [];
    const select1 = document.getElementById('compare-version-1');
    const select2 = document.getElementById('compare-version-2');
    if (!select1 || !select2) return;

    const v1 = versions.find((version) => version.id === select1.value);
    const v2 = versions.find((version) => version.id === select2.value);
    if (!v1 || !v2) {
        showToast(t('compare_choose_versions'), 'error');
        return;
    }
    if (v1.id === v2.id) {
        showToast(t('compare_choose_different'), 'warning');
        return;
    }

    const diffHtml = generateDiffRows(v1.content || '', v2.content || '', v1.versionNumber, v2.versionNumber);
    const result = document.getElementById('compare-result');
    if (!result) return;

    result.innerHTML = `
        <div class="compare-panel diff-shell">
            <div class="compare-panel-header">
                <span class="compare-panel-title">
                    <i class="fas fa-code-compare"></i> ${t('compare_between_versions', { first: v1.versionNumber, second: v2.versionNumber })}
                </span>
            </div>
            ${diffHtml || `<div class="compare-panel-content"><em>${t('compare_no_differences')}</em></div>`}
        </div>
    `;
}

function renderCompareState(title, message) {
    const result = document.getElementById('compare-result');
    if (!result) return;

    result.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-code-compare"></i>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function generateDiffRows(oldText, newText, oldVersionNumber, newVersionNumber) {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const rows = [];

    for (let index = 0; index < Math.max(oldLines.length, newLines.length); index += 1) {
        const oldLine = oldLines[index] || '';
        const newLine = newLines[index] || '';
        if (oldLine !== newLine) {
            const highlighted = highlightInlineDifference(oldLine, newLine);
            rows.push(`
                <div class="diff-row">
                    <div class="diff-cell diff-cell-removed">
                        <span class="diff-line-number">${index + 1}</span>
                        <span class="diff-line-text">${highlighted.oldHtml || '&nbsp;'}</span>
                    </div>
                    <div class="diff-cell diff-cell-added">
                        <span class="diff-line-number">${index + 1}</span>
                        <span class="diff-line-text">${highlighted.newHtml || '&nbsp;'}</span>
                    </div>
                </div>
            `);
        }
    }

    if (!rows.length) {
        return '';
    }

    return `
        <div class="diff-grid">
            <div class="diff-grid-header">
                <div class="diff-grid-title">${t('compare_version_label', { number: oldVersionNumber })}</div>
                <div class="diff-grid-title">${t('compare_version_label', { number: newVersionNumber })}</div>
            </div>
            <div class="diff-grid-body">
                ${rows.join('')}
            </div>
        </div>
    `;
}

function handleFirstVersionChange(event) {
    const selectedVersionId = event.target.value;
    const select2 = document.getElementById('compare-version-2');
    const versions = window.DMSState.compareVersions || [];
    if (!select2) return;

    if (!selectedVersionId) {
        select2.innerHTML = buildCompareOptions([], '');
        select2.value = '';
        select2.disabled = true;
        return;
    }

    const selectedVersion = versions.find((version) => version.id === selectedVersionId);
    if (!selectedVersion) {
        select2.innerHTML = buildCompareOptions([], '');
        select2.value = '';
        select2.disabled = true;
        return;
    }

    const availableSecondVersions = versions.filter((version) => version.versionNumber > selectedVersion.versionNumber);
    select2.innerHTML = buildCompareOptions(availableSecondVersions, '');
    select2.value = '';
    select2.disabled = availableSecondVersions.length === 0;

    if (!availableSecondVersions.length) {
        showToast(t('compare_no_newer_version'), 'warning');
    }
}

function buildCompareOptions(versions, selectedId) {
    const placeholder = `<option value="">${t('compare_select_version')}</option>`;
    const options = versions.map((version) => `
        <option value="${version.id}" ${selectedId === version.id ? 'selected' : ''}>
            v${version.versionNumber} - ${getStatusText(version.status)}
        </option>
    `).join('');

    return placeholder + options;
}

function highlightInlineDifference(oldLine, newLine) {
    return {
        oldHtml: buildWordDiffHtml(oldLine, newLine, 'removed'),
        newHtml: buildWordDiffHtml(newLine, oldLine, 'added')
    };
}

function buildWordDiffHtml(sourceText, compareText, type) {
    const sourceTokens = tokenizeDiffText(sourceText);
    const compareTokens = tokenizeDiffText(compareText);
    const matchingIndexes = buildLcsIndexSet(sourceTokens, compareTokens);

    return sourceTokens.map((token, index) => {
        const escaped = escapeHtml(token.value);
        if (token.type === 'space') {
            return escaped;
        }

        return matchingIndexes.has(index)
            ? escaped
            : `<span class="diff-inline diff-inline-${type}">${escaped}</span>`;
    }).join('');
}

function tokenizeDiffText(text) {
    return (text.match(/\s+|[^\s]+/g) || []).map((value) => ({
        value,
        type: /\s+/.test(value) ? 'space' : 'word'
    }));
}

function buildLcsIndexSet(sourceTokens, compareTokens) {
    const sourceWords = sourceTokens.filter((token) => token.type === 'word').map((token) => token.value);
    const compareWords = compareTokens.filter((token) => token.type === 'word').map((token) => token.value);
    const dp = Array.from({ length: sourceWords.length + 1 }, () => Array(compareWords.length + 1).fill(0));

    for (let sourceIndex = sourceWords.length - 1; sourceIndex >= 0; sourceIndex -= 1) {
        for (let compareIndex = compareWords.length - 1; compareIndex >= 0; compareIndex -= 1) {
            if (sourceWords[sourceIndex] === compareWords[compareIndex]) {
                dp[sourceIndex][compareIndex] = dp[sourceIndex + 1][compareIndex + 1] + 1;
            } else {
                dp[sourceIndex][compareIndex] = Math.max(
                    dp[sourceIndex + 1][compareIndex],
                    dp[sourceIndex][compareIndex + 1]
                );
            }
        }
    }

    const matchingWordIndexes = new Set();
    let sourceIndex = 0;
    let compareIndex = 0;

    while (sourceIndex < sourceWords.length && compareIndex < compareWords.length) {
        if (sourceWords[sourceIndex] === compareWords[compareIndex]) {
            matchingWordIndexes.add(sourceIndex);
            sourceIndex += 1;
            compareIndex += 1;
        } else if (dp[sourceIndex + 1][compareIndex] >= dp[sourceIndex][compareIndex + 1]) {
            sourceIndex += 1;
        } else {
            compareIndex += 1;
        }
    }

    const matchingTokenIndexes = new Set();
    let wordIndex = 0;

    sourceTokens.forEach((token, tokenIndex) => {
        if (token.type === 'word') {
            if (matchingWordIndexes.has(wordIndex)) {
                matchingTokenIndexes.add(tokenIndex);
            }
            wordIndex += 1;
        }
    });

    return matchingTokenIndexes;
}

document.addEventListener('DOMContentLoaded', initComparePage);

window.refreshPageTranslations = initComparePage;
