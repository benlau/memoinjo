import React from "react";
import BrowserService from "../services/browserservice";
import JoplinDataService, { Notebook } from "../services/joplindataservice";
import { breakdownUrl, hasNoValue, hasValue, normalizeLink } from "../helper";
import { Renderer } from "../utils/renderer";
import { useStateRef } from "../hooks/stateref";
import { AbortedError, useDebounceFunc } from "../hooks/debouncer";

export const WIZARD_VIEW = "#wizard-view";
export const JOPLIN_UNAVAILABLE_VIEW = "#joplin-web-clipper-error-view";
export const ERROR_PANEL_VIEW = "#error-view";
export const EDITOR_VIEW = "#editor-view";
export const LOADING_VIEW = "#loading-view";
export const SEARCHING_VIEW = "#searching-view";

export type Tab = {
    title: string;
    url: string;
    id: string;
};

const DEBOUNCE_TIME = 50;

function useMakeContext() {
    const joplinDataService = React.useMemo(() => new JoplinDataService(), []);
    const browserService = React.useMemo(() => new BrowserService(), []);
    const renderer = React.useMemo(() => new Renderer(), []);

    const [view, setView] = React.useState(LOADING_VIEW);
    const [error, setError] = React.useState(null);
    const [noteId, setNoteId] = React.useState("");
    const [noteTitle, setNoteTitle, noteTitleRef] = useStateRef<string>("");
    const [noteAvailable, setNoteAvailable] = React.useState(false);
    const [noteContent, setNoteContent, noteContentRef] =
        useStateRef<string>("");
    const [notebookId, setNotebookId] = React.useState("");
    const [currentTab, setCurrentTab] = React.useState<Tab | null>(null);
    const [notebooks, setNotebooks] = React.useState<Notebook[]>([]);
    const [_selectedNotebookId, setSelectedNotebookId, selectedNotebookIdRef] =
        useStateRef("");
    const [_tagId, setTagId, tagIdRef] = useStateRef("");

    const _upsertNote = React.useCallback(async () => {
        const noteTitle = noteTitleRef.current;
        const noteContent = noteContentRef.current;
        const tagId = tagIdRef.current;
        const selectedNotebookId = selectedNotebookIdRef.current;
        if (noteAvailable) {
            await joplinDataService.putNoteTitleBody(
                noteId,
                noteTitle,
                noteContent,
            );
        } else {
            await joplinDataService.createNote(
                noteId,
                selectedNotebookId,
                noteTitle,
                noteContent,
            );

            if (hasValue(tagId)) {
                await joplinDataService.setNoteTagId(noteId, tagId);
            }
        }

        if (!noteAvailable) {
            setNoteAvailable(true);
        }
    }, [
        noteId,
        noteAvailable,
        joplinDataService,
        selectedNotebookIdRef,
        noteTitleRef,
        noteContentRef,
        tagIdRef,
    ]);

    const debouncedUpsertNote = useDebounceFunc(_upsertNote, DEBOUNCE_TIME);
    const upsertNote = React.useCallback(async () => {
        debouncedUpsertNote().catch((e) => {
            if (e instanceof AbortedError) {
                return;
            }
            console.error(e);
        });
    }, [debouncedUpsertNote]);

    const searchRelatedNotes = React.useCallback(
        async (url, max, callback): Promise<number> => {
            const urls = breakdownUrl(url);
            let count = 0;
            const set = new Set();

            while (urls.length > 0) {
                const keyword = urls.shift();

                const notes = await joplinDataService.searchNotes(keyword);

                const filteredNotes = notes.filter((note) => {
                    const res = set.has(note.id);
                    if (!res) {
                        set.add(note.id);
                    }
                    return !res;
                });

                count += filteredNotes.length;

                const cont = await callback(filteredNotes, keyword);

                if (count >= max || cont === false) {
                    break;
                }
            }

            return count;
        },
        [joplinDataService],
    );

    const show = React.useCallback((view) => {
        setView(view);
    }, []);

    const showError = React.useCallback(
        (e) => {
            if (e.type === "ConnectionFailed") {
                show(JOPLIN_UNAVAILABLE_VIEW);
            } else {
                show(ERROR_PANEL_VIEW);
                setError(e);
            }
        },
        [show],
    );

    const forceRedraw = React.useCallback(() => {
        const fontFaceSheet = new CSSStyleSheet();
        fontFaceSheet.insertRule(`
        @keyframes redraw {
          0% {
            opacity: 1;
          }
          100% {
            opacity: .99;
          }
        }
      `);
        fontFaceSheet.insertRule(`
        html {
          animation: redraw 1s linear infinite;
        }
      `);
        document.adoptedStyleSheets = [
            ...document.adoptedStyleSheets,
            fontFaceSheet,
        ];
    }, []);

    const onSearchClicked = React.useCallback(() => {
        setView(SEARCHING_VIEW);
    }, []);

    React.useEffect(() => {
        const start = async () => {
            const { storageService } = joplinDataService;
            renderer.template = await storageService.getTemplate();

            const [tab] = await browserService.queryTabs({
                active: true,
                currentWindow: true,
            });

            try {
                await joplinDataService.load();
                if (hasNoValue(joplinDataService.apiToken)) {
                    show(WIZARD_VIEW);
                    await joplinDataService.requestPermission();
                    show(LOADING_VIEW);
                }

                const { title } = tab;
                const url = normalizeLink(tab.url);
                const currentTab = {
                    url,
                    title,
                    // TODO: Change to tab.id instead of urlToId
                    id: await joplinDataService.urlToId(url),
                };
                setCurrentTab(currentTab);

                // Upsert tag
                const tag = (await storageService.getTag()) ?? "";
                const tagId = hasValue(tag)
                    ? await joplinDataService.getOrCreateTag(tag)
                    : "";
                setTagId(tagId);

                const { notebooks, selectedNotebookId } =
                    await joplinDataService.getNotebooks();
                setNotebooks(notebooks);
                setSelectedNotebookId(selectedNotebookId);

                const newNoteId = currentTab.id;
                setNoteId(newNoteId);

                const note = await joplinDataService.getNote(newNoteId);

                if (note == null) {
                    setNotebookId(selectedNotebookId);
                    setNoteTitle(title);
                    setNoteAvailable(false);
                    setNoteContent(
                        renderer.render({
                            url: currentTab.url,
                            tag: tag,
                            tagId: tagId,
                            title: title,
                        }),
                    );
                } else {
                    setNotebookId(note.parent_id);
                    setNoteTitle(note.title);
                    setNoteContent(note.body);
                    setNoteAvailable(true);
                }

                show(EDITOR_VIEW);
            } catch (e) {
                showError(e);
            }
            forceRedraw();
        };

        start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectNotebook = React.useCallback(
        async (notebookId: string) => {
            setNotebookId(notebookId);
            await upsertNote();
            await joplinDataService.putNoteParentId(noteId, notebookId);
        },
        [noteId, upsertNote, joplinDataService],
    );

    return React.useMemo(() => {
        return {
            view,
            error,
            show,
            showError,
            noteId,
            noteTitle,
            noteAvailable,
            noteContent,
            notebookId,
            notebooks,
            upsertNote,
            selectNotebook,
            setNoteTitle,
            setNoteContent,
            onSearchClicked,
            currentTab,
            searchRelatedNotes,
        };
    }, [
        view,
        error,
        show,
        showError,
        noteId,
        noteTitle,
        noteAvailable,
        noteContent,
        notebooks,
        notebookId,
        upsertNote,
        selectNotebook,
        setNoteTitle,
        setNoteContent,
        onSearchClicked,
        currentTab,
        searchRelatedNotes,
    ]);
}

type PopupContextValue = ReturnType<typeof useMakeContext>;
const PopupContext = React.createContext<PopupContextValue>(null as any);

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const value = useMakeContext();
    return (
        <PopupContext.Provider value={value}>{children}</PopupContext.Provider>
    );
};

export function usePopupContext() {
    return React.useContext(PopupContext);
}
