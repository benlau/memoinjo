import React from "react";
import { useAutosize } from "../hooks/autosize";
import { usePopupContext } from "../contexts/popupcontext";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

function padSpace(title: string, level: number) {
    const pad = "&nbsp;&nbsp;&nbsp;&nbsp;";
    return title.padStart(level * pad.length + title.length, pad);
}

export function EditorView() {
    const {
        notebooks,
        noteId,
        noteTitle,
        noteAvailable,
        noteContent,
        notebookId,
        upsertNote,
        selectNotebook,
        setNoteTitle,
        setNoteContent,
        onSearchClicked,
    } = usePopupContext();
    const textareaRef = useAutosize();

    const options = notebooks
        .map((notebook) => {
            const notebookTitle = padSpace(notebook.title, notebook.level);
            return `<option value=${notebook.id}>${notebookTitle}</option>`;
        })
        .join("");

    return (
        <>
            <div
                id="button-bar"
                className="text-left flex justify-between items-center"
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
                    className="text-[#212529] no-underline hover:text-[#7f212529] visited:text-[#7f212529] active:text-[#7f212529]"
                    onClick={(e) => {
                        e.preventDefault();
                        onSearchClicked();
                    }}
                >
                    <h5 className="mb-0">
                        <MagnifyingGlassIcon />
                    </h5>
                </a>
            </div>

            <select
                id="notebook-select"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={notebookId}
                onChange={async (e) => {
                    selectNotebook(e.target.value);
                }}
                dangerouslySetInnerHTML={{ __html: options }}
            />

            <input
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="title-input"
                value={noteTitle}
                onChange={async (e) => {
                    setNoteTitle(e.target.value);
                    await upsertNote();
                }}
                placeholder=""
            />
            <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
