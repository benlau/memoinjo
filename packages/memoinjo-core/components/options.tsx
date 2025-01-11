import React from "react";
import StorageService from "../services/storageservice";
import JoplinDataService, { Notebook } from "../services/joplindataservice";

export function useOptionsState() {
    const joplin = React.useMemo(() => new JoplinDataService(), []);
    const storageService = React.useMemo(() => new StorageService(), []);

    const [saveButtonEnabled, setSaveButtonEnabled] = React.useState(false);
    const [notebooks, setNotebooks] = React.useState<Notebook[]>([]);
    const [selectedNotebookId, setSelectedNotebookId] = React.useState("");
    const [tag, _setTag] = React.useState("");
    const [template, _setTemplate] = React.useState("");
    const [apiToken, _setApiToken] = React.useState("");

    const enableSaveButton = React.useCallback(() => {
        setSaveButtonEnabled(true);
    }, [setSaveButtonEnabled]);

    const setTag = React.useCallback(
        (value) => {
            _setTag(value);
            enableSaveButton();
        },
        [enableSaveButton],
    );

    const setTemplate = React.useCallback(
        (value) => {
            _setTemplate(value);
            enableSaveButton();
        },
        [enableSaveButton],
    );

    const setApiToken = React.useCallback(
        (value) => {
            _setApiToken(value);
            enableSaveButton();
        },
        [enableSaveButton],
    );

    const refreshNotebooks = React.useCallback(async () => {
        try {
            const { notebooks, selectedNotebookId } =
                await joplin.getNotebooks();
            if (notebooks === undefined || notebooks.length === 0) {
                throw new Error("Notebooks Unavailable");
            }
            setNotebooks(notebooks);
            setSelectedNotebookId(selectedNotebookId);
        } catch (e) {}
    }, [joplin]);

    const save = React.useCallback(async () => {
        await storageService.set(StorageService.Template, template);
        await storageService.set(StorageService.Tag, tag);
        await storageService.set(StorageService.ApiToken, apiToken);
        joplin.setApiToken(apiToken);
        if (selectedNotebookId != null) {
            await storageService.set(
                StorageService.SelectedNotebookId,
                selectedNotebookId,
            );
        }
        setSaveButtonEnabled(false);
        await refreshNotebooks();
    }, [
        joplin,
        storageService,
        setSaveButtonEnabled,
        refreshNotebooks,
        selectedNotebookId,
        tag,
        template,
        apiToken,
    ]);

    React.useEffect(() => {
        async function init() {
            await joplin.load();

            setApiToken(await storageService.get(StorageService.ApiToken));
            setTag(await storageService.getTag());

            setTemplate(await storageService.getTemplate());

            setSelectedNotebookId(
                ((await storageService.get(
                    StorageService.SelectedNotebookId,
                )) as string) ?? "",
            );

            setSaveButtonEnabled(true);
            refreshNotebooks();
        }
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onNotebookChange = React.useCallback(
        (event) => {
            setSelectedNotebookId(event.target.value);
            enableSaveButton();
        },
        [setSelectedNotebookId, enableSaveButton],
    );

    return {
        saveButtonEnabled,
        setSaveButtonEnabled,
        selectedNotebookId,
        notebooks,
        onNotebookChange,
        tag,
        setTag,
        template,
        setTemplate,
        apiToken,
        setApiToken,
        save,
    };
}

const Options: React.FC = () => {
    const {
        saveButtonEnabled,
        selectedNotebookId,
        notebooks,
        onNotebookChange,
        tag,
        setTag,
        template,
        setTemplate,
        apiToken,
        setApiToken,
        save,
    } = useOptionsState();

    return (
        <div id="options">
            <div className="w-full flex">
                <div className="w-1/2 mx-auto">
                    <div className="mt-10 border rounded-lg shadow ">
                        <div className="border-b p-4 bg-gray-100">
                            <div className="flex justify-between items-center">
                                <div className="w-2/3">
                                    <h3 className="text-2xl font-semibold m-0">
                                        MemoInjo Options
                                    </h3>
                                </div>
                                <div className="w-1/3">
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!saveButtonEnabled}
                                            id="saveButton"
                                            onClick={save}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <ul className="divide-y">
                                <li className="py-4">
                                    <div className="flex">
                                        <div className="w-1/2 mt-2">
                                            <h6 className="font-normal text-sm">
                                                Joplin API Key
                                            </h6>
                                        </div>
                                        <div className="w-1/2">
                                            <input
                                                className="w-full border rounded px-3 py-2"
                                                id="joplinApiKeyInput"
                                                placeholder="Joplin Data API Key"
                                                value={apiToken}
                                                onChange={(e) =>
                                                    setApiToken(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </li>

                                <li className="py-4">
                                    <div className="flex">
                                        <div className="w-1/2 mt-2">
                                            <h6 className="font-normal text-sm">
                                                Default Notebook
                                            </h6>
                                        </div>
                                        <div className="w-1/4 mt-1 text-right mr-2">
                                            <a
                                                href={`joplin://x-callback-url/openFolder?id=${selectedNotebookId}`}
                                                id="openJoplinLink"
                                                className="text-blue-500 hover:text-blue-600"
                                            >
                                                Open in Joplin
                                            </a>
                                        </div>
                                        <div className="w-1/4">
                                            <select
                                                id="notebook-select"
                                                className="w-full border rounded px-2 py-1 mb-2 disabled:bg-gray-100"
                                                disabled={
                                                    notebooks.length === 0
                                                }
                                                value={selectedNotebookId}
                                                onChange={onNotebookChange}
                                            >
                                                {notebooks.length === 0 ? (
                                                    <option>Unavailable</option>
                                                ) : (
                                                    notebooks.map(
                                                        (notebook) => (
                                                            <option
                                                                key={
                                                                    notebook.id
                                                                }
                                                                value={
                                                                    notebook.id
                                                                }
                                                            >
                                                                {"\u00A0".repeat(
                                                                    notebook.level *
                                                                        4,
                                                                )}
                                                                {notebook.title}
                                                            </option>
                                                        ),
                                                    )
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </li>

                                <li className="py-4">
                                    <div className="flex">
                                        <div className="w-2/3 mt-2">
                                            <h6 className="font-normal text-sm">
                                                Default Tag
                                            </h6>
                                        </div>
                                        <div className="w-1/3">
                                            <input
                                                className="w-full border rounded px-3 py-2"
                                                id="tagInput"
                                                placeholder="tag"
                                                value={tag}
                                                onChange={(e) =>
                                                    setTag(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </li>

                                <li className="py-4">
                                    <div>
                                        <h6 className="font-normal text-sm mb-3">
                                            Memo Template
                                        </h6>
                                        <textarea
                                            className="w-full border rounded px-3 py-2"
                                            rows={8}
                                            id="templateTextArea"
                                            value={template}
                                            onChange={(e) =>
                                                setTemplate(e.target.value)
                                            }
                                        ></textarea>
                                        <p className="text-sm text-gray-600 mt-2 mb-4">
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
