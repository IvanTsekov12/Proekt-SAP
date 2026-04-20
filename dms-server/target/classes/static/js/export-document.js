function initExportPage() {
    const exportContent = document.getElementById('export-content');
    if (!exportContent) return;

    const documentId = getCurrentDocumentId();
    const versionId = localStorage.getItem('dms_export_version_id');
    if (!documentId || !versionId) return;

    getVersions(documentId).then((versions) => {
        if (Array.isArray(versions) && versions.length === 1 && versions[0].versionNumber === 1 && versions[0].status === 'REJECTED') {
            showToast(t('export_not_allowed_rejected'), 'warning');
            window.location.href = 'versions.html';
            return;
        }

        const version = (versions || []).find((item) => item.id === versionId);
        if (!version) {
            showToast('Версията не е намерена', 'error');
            return;
        }
        window.currentExportVersion = version;
        exportContent.value = version.content || '';
        const title = document.getElementById('export-modal-title');
        if (title) {
            title.innerHTML = `<i class="fas fa-download"></i> ${t('export_version_title', { version: version.versionNumber })}`;
        }
    }).catch((error) => showToast(error.message, 'error'));

    document.querySelectorAll('.export-option-btn').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const format = button.textContent.includes('PDF') ? 'pdf' : 'txt';
            exportDocument(format);
        });
    });
}

function exportDocument(format) {
    const exportContent = document.getElementById('export-content');
    const content = exportContent ? exportContent.value : '';
    if (!content) {
        showToast(t('export_no_content'), 'warning');
        return;
    }

    const versionInfo = window.currentExportVersion;
    const versionNumber = versionInfo ? `_v${versionInfo.versionNumber}` : '';
    const filename = `${getCurrentDocumentTitle()}${versionNumber}`;

    if (format === 'txt') {
        downloadFile(content, `${filename}.txt`, 'text/plain');
    } else if (format === 'pdf') {
        generatePDF(content);
    }

    showToast(t('export_success', { format: format.toUpperCase() }), 'success');
    const logVersion = versionInfo ? ` (v${versionInfo.versionNumber})` : '';
    addAuditLog('EXPORT', `Експортиран документ: "${getCurrentDocumentTitle()}"${logVersion} като ${format.toUpperCase()}`, getCurrentUser(), {
        eventType: 'document_exported',
        documentTitle: getCurrentDocumentTitle(),
        versionNumber: versionInfo ? versionInfo.versionNumber : null,
        format
    });
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function generatePDF(content) {
    const versionInfo = window.currentExportVersion;
    const locale = getLanguage() === 'bg' ? 'bg-BG' : 'en-US';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${getCurrentDocumentTitle()}${versionInfo ? ` - v${versionInfo.versionNumber}` : ''}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                h1 { color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
                .version { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                .version-title { font-weight: bold; color: #6366f1; margin-bottom: 10px; }
                pre { white-space: pre-wrap; font-family: monospace; }
            </style>
        </head>
        <body>
            <h1>${escapeHtml(getCurrentDocumentTitle())}</h1>
            <p><small>${t('export_generated_at')} ${new Date().toLocaleString(locale)}</small></p>
            <div class="version">
                <div class="version-title">${t('export_version_label', { version: versionInfo ? versionInfo.versionNumber : '?' })} (${versionInfo ? getStatusText(versionInfo.status) : t('export_unknown')})</div>
                <pre>${escapeHtml(content || t('no_content'))}</pre>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

document.addEventListener('DOMContentLoaded', initExportPage);
