import StorageService from "./services/storageservice.js";
import JoplinDataService from "./services/joplindataservice.js";
import { getSelectedNotebookId, hasValue } from "./helper.js";
import Constants from "./constants.js";

const saveButton = $("#saveButton");
const joplinApiKeyInput = $("#joplinApiKeyInput");
const templateTextArea = $("#templateTextArea");
const tagInput = $("#tagInput");
const notebookSelect = $("#notebookSelect");
const openJoplinLink = $("#openJoplinLink");

const joplin = new JoplinDataService();
const storageService = new StorageService();

function setSaveButtionEnabled(value) {
    saveButton.attr("disabled", !value);
}

function enableSaveButton() {
    setSaveButtionEnabled(true);
}

async function updateNotebooks() {
    try {
        const notebooks = await joplin.getNotebooks();
        if (notebooks === undefined || notebooks.length === 0) {
            throw new Error("Notebooks Unavailable");
        }
        notebookSelect.empty();
        notebooks.forEach((notebook) => {
            const pad = "&nbsp;&nbsp;&nbsp;&nbsp;";
            const notebookTitle = notebook.title.padStart(
                notebook.level * pad.length + notebook.title.length,
                pad,
            );
            notebookSelect.append(`<option value="${notebook.id}">${notebookTitle}</option>`);
        });

        const selectedNotebookId = await getSelectedNotebookId(notebooks);
        notebookSelect.val(selectedNotebookId);
        notebookSelect.prop("disabled", false);
        openJoplinLink.attr("href", `joplin://x-callback-url/openFolder?id=${selectedNotebookId}`);
    } catch (e) {
        notebookSelect.empty();
        notebookSelect.append("<option>Unavailable</option>");
        notebookSelect.prop("disabled", true);
        openJoplinLink.attr("href", "joplin://x-callback-url/openFolder?id=");
    }
}

async function save() {
    const apiToken = joplinApiKeyInput.val().trim();
    await storageService.set(StorageService.Template, templateTextArea.val());
    await storageService.set(StorageService.Tag, tagInput.val());
    await storageService.set(StorageService.ApiToken, apiToken);
    joplin.apiToken = apiToken;
    const selectedNotebookId = notebookSelect.val();
    if (hasValue(selectedNotebookId)) {
        await storageService.set(StorageService.SelectedNotebookId, selectedNotebookId);
    }
    setSaveButtionEnabled(false);
    await updateNotebooks();
}

async function start() {
    await joplin.load();

    $(joplinApiKeyInput).val(await storageService.get(StorageService.ApiToken));
    $(tagInput).val(await storageService.getTag());

    const template = await storageService.getTemplate();
    templateTextArea.val(template);

    templateTextArea.on("input propertychange", async (event) => {
        let content = event.target.value;
        if (content.trim() === "") {
            // Restore to default if removed completely
            content = Constants.DefaultTemplateValue;
            $(templateTextArea).val(content);
        }
        setSaveButtionEnabled(true);
    });

    tagInput.on("input property change", enableSaveButton);

    joplinApiKeyInput.on("input property change", enableSaveButton);

    notebookSelect.on("change", enableSaveButton);

    saveButton.on("click", save);

    await updateNotebooks();
}

start();
