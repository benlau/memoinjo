import React from "react";
import BrowserService from "../services/browserservice";
import JoplinDataService from "../services/joplindataservice";
import PopupService from "../services/popupservice";
import { hasNoValue } from "../helper";

export const WIZARD_VIEW = "#wizard-view";
export const JOPLIN_UNAVAILABLE_VIEW = "#joplin-web-clipper-error-view";
export const ERROR_PANEL_VIEW = "#error-view";
export const EDITOR_VIEW = "#editor-view";
export const LOADING_VIEW = "#loading-view";
export const SEARCHING_VIEW = "#searching-view";

function useMakeContext() {
    const joplinDataService = React.useMemo(() => new JoplinDataService(), []);
    const browserService = React.useMemo(() => new BrowserService(), []);
    const popupService = React.useMemo(
        () => new PopupService(joplinDataService, browserService),
        [joplinDataService, browserService],
    );

    const [view, setView] = React.useState(LOADING_VIEW);
    const [error, setError] = React.useState(null);
    const [noteId, setNoteId] = React.useState("");
    const [noteTitle, setNoteTitle] = React.useState("");
    const [noteAvailable, setNoteAvailable] = React.useState(false);
    const [noteContent, setNoteContent] = React.useState("");
    const [notebookId, setNotebookId] = React.useState("");

    // TODO: Change to useState
    const { notebooks } = popupService;

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
            const { joplinDataService } = popupService;
            try {
                await joplinDataService.load();
                if (hasNoValue(joplinDataService.apiToken)) {
                    show(WIZARD_VIEW);
                    await joplinDataService.requestPermission();
                    show(LOADING_VIEW);
                }
                await popupService.load();

                const newNoteId = popupService.currentTab.id;
                setNoteId(newNoteId);

                const { selectedNotebookId } = popupService;

                const note = await joplinDataService.getNote(newNoteId);
                if (note === undefined) {
                    setNotebookId(selectedNotebookId);
                    setNoteTitle(popupService.currentTab.title);
                    setNoteAvailable(false);
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
            await upsertNote();
            await joplinDataService.putNoteParentId(noteId, notebookId);
        },
        [noteId, upsertNote, joplinDataService],
    );

    return React.useMemo(() => {
        return {
            popupService,
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
        };
    }, [
        popupService,
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
