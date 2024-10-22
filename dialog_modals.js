listenImportExport();

function openDialogImport() {
    document.getElementById("importSettings").showModal();
    document.getElementById("importSettingsInput").blur();
}

function openDialogExport() {
    document.getElementById("exportSettings").showModal();
    document.getElementById("exportSettingsOutput").value = exportRules();
    // document.getElementById("exportSettingsOutput").innerHTML = exportRules();
}

function closeDialogImport() {
    document.getElementById("importSettings").close();
}

function closeDialogExport() {
    document.getElementById("exportSettings").close();
}

function listenImportExport() {
    document.body.addEventListener('keydown', function (event) {
        const key = event.key;

        switch (key) {
            case "[":
                openDialogImport();
                break;
            case "]":
                openDialogExport();
                break;
        }
    });
}

function getImportSettings() {
    return document.getElementById("importSettingsInput").value;
}

function dialogImportRules() {
    importRules(getImportSettings());
    closeDialogImport();
}