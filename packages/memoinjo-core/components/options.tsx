import React from "react";
import StorageService from "../services/storageservice.js";
import JoplinDataService from "../services/joplindataservice.js";
import { hasValue } from "../helper.js";
import Constants from "../constants.js";
import "./options.css";
import "../lib/bower_components/bootstrap.min.css";

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

    React.useEffect(() => {
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

const Options: React.FC = () => {
    useOptions();

    return (
        <div id="options">
            <div className="row w-100">
                <div className="col-md-6 mx-auto">
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-8">
                                    <h3 className="header">MemoInjo Options</h3>
                                </div>
                                <div className="col-md-4">
                                    <div className="text-end">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled
                                            id="saveButton"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item">
                                    <div className="row">
                                        <div className="col-md-6 mt-2">
                                            <h6>Joplin API Key</h6>
                                        </div>
                                        <div className="col-md-6">
                                            <input
                                                className="form-control"
                                                id="joplinApiKeyInput"
                                                placeholder="Joplin Data API Key"
                                            />
                                        </div>
                                    </div>
                                </li>

                                <li className="list-group-item">
                                    <div className="row">
                                        <div className="col-md-6 mt-2">
                                            <h6>Default Notebook</h6>
                                        </div>
                                        <div className="col-md-2 mt-1 text-end">
                                            <a href="#" id="openJoplinLink">
                                                Open in Joplin
                                            </a>
                                        </div>
                                        <div className="col-md-4">
                                            <select
                                                id="notebook-select"
                                                className="form-select form-select-sm mb-2"
                                                disabled
                                            ></select>
                                        </div>
                                    </div>
                                </li>

                                <li className="list-group-item">
                                    <div className="row">
                                        <div className="col-md-8 mt-2">
                                            <h6>Default Tag</h6>
                                        </div>
                                        <div className="col-md-4">
                                            <input
                                                className="form-control"
                                                id="tagInput"
                                                placeholder="tag"
                                            />
                                        </div>
                                    </div>
                                </li>

                                <li className="list-group-item">
                                    <div className="row">
                                        <h6 className="mb-3">Memo Template</h6>
                                        <textarea
                                            className="form-control"
                                            rows="8"
                                            id="templateTextArea"
                                        ></textarea>
                                        <p className="mb-4 mt-2">
                                            Variables: url, title, tag
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Options;
