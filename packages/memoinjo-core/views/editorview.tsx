import React from "react";
import Renderer from "../renderer.js";
import PopupService from "../services/popupservice";
import { useAutosize } from "../hooks/autosize";

type Props = {
    popupService: PopupService;
    onSearchClicked: () => void;
};

export function EditorView({ popupService, onSearchClicked }: Props) {
    const [noteId, setNoteId] = React.useState("");
    const [noteTitle, setNoteTitle] = React.useState("");
    const [noteAvailable, setNoteAvailable] = React.useState(false);
    const [noteContent, setNoteContent] = React.useState("");
    const [notebookId, setNotebookId] = React.useState("");
    const renderer = React.useMemo(() => new Renderer(), []);
    const { joplinDataService } = popupService;
    const { storageService } = joplinDataService;
    const { notebooks } = popupService;
    const textareaRef = useAutosize();

    const upsertNote = React.useCallback(async () => {
        await popupService.upsertNote(
            noteId,
            noteTitle,
            noteContent,
            noteAvailable,
        );
        if (!noteAvailable) {
            setNoteAvailable(true);
        }
    }, [noteId, noteTitle, noteContent, noteAvailable, popupService]);

    const load = React.useCallback(async () => {
        const newNoteId = popupService.currentTab.id;
        setNoteId(newNoteId);

        const { selectedNotebookId } = popupService;

        const note = await joplinDataService.getNote(newNoteId);
        if (note === undefined) {
            renderer.template = await storageService.getTemplate();
            setNotebookId(selectedNotebookId);
            setNoteTitle(popupService.currentTab.title);
            const { url, title } = popupService.currentTab;
            const { tag, tagId } = popupService;
            setNoteContent(
                renderer.render({
                    url,
                    tag,
                    tagId,
                    title,
                }),
            );
            setNoteAvailable(false);
        } else {
            setNotebookId(note.parent_id);
            setNoteTitle(note.title);
            setNoteContent(note.body);
            setNoteAvailable(true);
        }
    }, [
        popupService,
        renderer,
        setNotebookId,
        setNoteTitle,
        setNoteContent,
        setNoteAvailable,
        joplinDataService,
        storageService,
    ]);

    React.useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div
                id="button-bar"
                className="text-start d-flex justify-content-between align-items-center"
            >
                {!noteAvailable ? (
                    <a
                        id="create-note-link"
                        href="#"
                        className="text-blue-500 hover:text-blue-600"
                        onClick={async (e) => {
                            e.preventDefault();
                            await upsertNote();
                        }}
                    >
                        Create
                    </a>
                ) : (
                    <a
                        id="open-in-joplin-link"
                        href={`joplin://x-callback-url/openNote?id=${noteId}`}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        Open in Joplin
                    </a>
                )}
                <a
                    id="search-link"
                    href="#"
                    className="icon-button"
                    onClick={(e) => {
                        e.preventDefault();
                        onSearchClicked();
                    }}
                >
                    <h5 className="mb-0">
                        <i className="mdi mdi-magnify"></i>
                    </h5>
                </a>
            </div>

            <select
                id="notebook-select"
                className="form-select form-select-sm mb-2"
                value={notebookId}
                onChange={async (e) => {
                    const newNotebookId = e.target.value;
                    await upsertNote();
                    await joplinDataService.putNoteParentId(
                        noteId,
                        newNotebookId,
                    );
                }}
            >
                {notebooks.map((notebook) => (
                    <option key={notebook.id} value={notebook.id}>
                        {notebook.title}
                    </option>
                ))}
            </select>

            <input
                className="form-control"
                id="title-input"
                value={noteTitle}
                onChange={async (e) => {
                    setNoteTitle(e.target.value);
                    await upsertNote();
                }}
                placeholder=""
            />
            <textarea
                className="form-control"
                id="note-editor"
                value={noteContent}
                onChange={async (e) => {
                    setNoteContent(e.target.value);
                    await upsertNote();
                }}
                autoFocus
                ref={textareaRef}
            ></textarea>
        </>
    );
}
