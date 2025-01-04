import React, { useEffect } from "react";
import StorageService from "./services/storageservice.js";
import JoplinDataService from "./services/joplindataservice.js";
import { hasValue } from "./helper.js";
import Constants from "./constants.js";
import "./options.css";
import "./lib/bower_components/bootstrap.min.css";

export function useOptions() {
    const joplin = React.useMemo(() => new JoplinDataService(), []);
    const storageService = React.useMemo(() => new StorageService(), []);

    const setSaveButtionEnabled = React.useCallback((value) => {
        const saveButton = document.getElementById("saveButton");
        saveButton.disabled = !value;
    }, []);

    const enableSaveButton = React.useCallback(() => {
        setSaveButtionEnabled(true);
    }, [setSaveButtionEnabled]);

    const updateNotebooks = React.useCallback(async () => {
        const notebookSelect = document.getElementById("notebook-select");
        const openJoplinLink = document.getElementById("openJoplinLink");

        try {
            const { notebooks, selectedNotebookId } =
                await joplin.getNotebooks();
            if (notebooks === undefined || notebooks.length === 0) {
                throw new Error("Notebooks Unavailable");
            }
            notebookSelect.innerHTML = "";
            notebooks.forEach((notebook) => {
                const pad = "&nbsp;&nbsp;&nbsp;&nbsp;";
                const notebookTitle = notebook.title.padStart(
                    notebook.level * pad.length + notebook.title.length,
                    pad,
                );
                const option = document.createElement("option");
                option.value = notebook.id;
                option.innerHTML = notebookTitle;
                notebookSelect.appendChild(option);
            });

            notebookSelect.value = selectedNotebookId;
            notebookSelect.disabled = false;
            openJoplinLink.href = `joplin://x-callback-url/openFolder?id=${selectedNotebookId}`;
        } catch (e) {
            notebookSelect.innerHTML = "";
            const option = document.createElement("option");
            option.innerHTML = "Unavailable";
            notebookSelect.appendChild(option);
            notebookSelect.disabled = true;
            openJoplinLink.href = "joplin://x-callback-url/openFolder?id=";
        }
    }, [joplin]);

    const save = React.useCallback(async () => {
        const joplinApiKeyInput = document.getElementById("joplinApiKeyInput");
        const templateTextArea = document.getElementById("templateTextArea");
        const tagInput = document.getElementById("tagInput");
        const notebookSelect = document.getElementById("notebook-select");

        const apiToken = joplinApiKeyInput.value.trim();
        await storageService.set(
            StorageService.Template,
            templateTextArea.value,
        );
        await storageService.set(StorageService.Tag, tagInput.value);
        await storageService.set(StorageService.ApiToken, apiToken);
        joplin.apiToken = apiToken;
        const selectedNotebookId = notebookSelect.value;
        if (hasValue(selectedNotebookId)) {
            await storageService.set(
                StorageService.SelectedNotebookId,
                selectedNotebookId,
            );
        }
        setSaveButtionEnabled(false);
        await updateNotebooks();
    }, [joplin, storageService, setSaveButtionEnabled, updateNotebooks]);

    useEffect(() => {
        const joplinApiKeyInput = document.getElementById("joplinApiKeyInput");
        const templateTextArea = document.getElementById("templateTextArea");
        const tagInput = document.getElementById("tagInput");
        const notebookSelect = document.getElementById("notebook-select");
        const saveButton = document.getElementById("saveButton");

        async function init() {
            await joplin.load();

            joplinApiKeyInput.value = await storageService.get(
                StorageService.ApiToken,
            );
            tagInput.value = await storageService.getTag();

            const template = await storageService.getTemplate();
            templateTextArea.value = template;

            templateTextArea.addEventListener("input", async (event) => {
                let content = event.target.value;
                if (content.trim() === "") {
                    // Restore to default if removed completely
                    content = Constants.DefaultTemplateValue;
                    templateTextArea.value = content;
                }
                setSaveButtionEnabled(true);
            });

            tagInput.addEventListener("input", enableSaveButton);
            joplinApiKeyInput.addEventListener("input", enableSaveButton);
            notebookSelect.addEventListener("change", enableSaveButton);
            saveButton.addEventListener("click", save);

            await updateNotebooks();
        }

        init();

        // Cleanup listeners
        return () => {
            templateTextArea.removeEventListener("input", enableSaveButton);
            tagInput.removeEventListener("input", enableSaveButton);
            joplinApiKeyInput.removeEventListener("input", enableSaveButton);
            notebookSelect.removeEventListener("change", enableSaveButton);
            saveButton.removeEventListener("click", save);
        };
    }, [
        joplin,
        storageService,
        enableSaveButton,
        setSaveButtionEnabled,
        save,
        updateNotebooks,
    ]);
}
