import {
    normalizeLink, hasValue,
    hasNoValue,
} from "../helper.js";
import Renderer from "../renderer.js";

export default class PopupView {
    static WIZARD_VIEW = "#wizard";

    static JOPLIN_UNAVAILABLE_VIEW = "#joplinWebClipperNotAvailable";

    static ERROR_PANEL_VIEW = "#errorPanel";

    static EDITOR_VIEW = "#editor";

    static LOADING_VIEW = "#loading-view";

    constructor(joplinDataService, browserService) {
        this.browserService = browserService;
        this.joplinDataService = joplinDataService;
        this.renderer = new Renderer();

        this.noteId = "";
        this.noteContent = "";
        this.noteCreated = false;
        this.noteTitle = "";
        this.tagId = "";
        this.selectedNotebookId = "";
        this.notebooks = [];
    }

    initialize() {
        const ids = [
            PopupView.WIZARD_VIEW,
            PopupView.JOPLIN_UNAVAILABLE_VIEW,
            PopupView.ERROR_PANEL_VIEW,
            PopupView.EDITOR_VIEW,
            PopupView.LOADING_VIEW,
        ];
        this.views = ids.map((id) => ({
            key: id,
            value: $(id),
        })).reduce((arr, item) => {
            // eslint-disable-next-line
            arr[item.key] = item.value;
            return arr;
        }, {});

        this.editorView = this.views[PopupView.EDITOR_VIEW];
        this.noteEditor = $("#noteEditor");
        this.titleInput = $("#titleInput");
        this.notebookSelect = $("#notebookSelect");
        this.launchButtonLink = $("#launchButtonLink");
    }

    async start() {
        const {
            joplinDataService,
        } = this;
        try {
            await joplinDataService.load();
            if (hasNoValue(joplinDataService.apiToken)) {
                this.show(PopupView.WIZARD_VIEW);
                await joplinDataService.requestPermission();
                this.show(PopupView.LOADING_VIEW);
            }
            await this.load();
            this.refresh();
        } catch (e) {
            this.showError(e);
        }
        this.forceRedraw();
    }

    show(view) {
        Object.entries(this.views).forEach(([key, value]) => {
            if (key === view) {
                value.removeClass("d-none");
            } else {
                value.addClass("d-none");
            }
        });
    }

    refreshNotebooks(notebooks) {
        notebooks.forEach((notebook) => {
            const pad = "&nbsp;&nbsp;&nbsp;&nbsp;";
            const notebookTitle = notebook.title.padStart(
                notebook.level * pad.length + notebook.title.length,
                pad,
            );
            this.notebookSelect.append(`<option value="${notebook.id}">${notebookTitle}</option>`);
        });
    }

    async load() {
        const {
            browserService,
            joplinDataService,
            renderer,
        } = this;
        const {
            storageService,
        } = joplinDataService;

        const joplin = joplinDataService;

        const [currentTab] = await browserService.queryTabs({ active: true, currentWindow: true });
        const {
            title,
        } = currentTab;
        const url = normalizeLink(currentTab.url);
        this.noteTitle = title;
        const id = await joplinDataService.urlToId(url);
        this.noteId = id;

        const {
            notebooks,
            selectedNotebookId,
        } = await joplin.getNotebooks();

        this.selectedNotebookId = selectedNotebookId;
        this.notebooks = notebooks;

        const tag = await storageService.getTag() ?? "";
        const tagId = hasValue(tag) ? await joplin.getOrCreateTag(tag) : "";
        this.tagId = tagId;

        let note = await joplin.getNote(id);
        if (note === undefined) {
            const parentId = selectedNotebookId;
            renderer.template = await storageService.getTemplate();
            const body = renderer.render({
                url, tag, tagId, title,
            });
            note = await joplin.createNote(id, parentId, title, body, tagId);
            if (hasValue(tagId)) {
                await joplin.setNoteTagId(note.id, tagId);
            }
        }
        this.selectedNotebookId = note.parent_id;
        this.noteTitle = note.title;
        this.noteContent = note.body;
    }

    refresh() {
        const {
            titleInput,
            noteEditor, notebookSelect, launchButtonLink,
        } = this;

        titleInput.val(this.noteTitle);

        const joplinLink = `joplin://x-callback-url/openNote?id=${this.noteId}`;
        launchButtonLink.attr("href", joplinLink);

        this.refreshNotebooks(this.notebooks);

        notebookSelect.val(this.selectedNotebookId);

        titleInput.val(this.noteTitle);

        noteEditor.textareaAutoSize();
        noteEditor.val(this.noteContent).trigger("input");

        this.show(PopupView.EDITOR_VIEW);
        noteEditor.trigger("focus");
        this.listen();
    }

    listen() {
        const id = this.noteId;
        const {
            titleInput, joplinDataService,
            noteEditor, notebookSelect,
        } = this;

        titleInput.on("input propertychange", async (event) => {
            const text = event.target.value;
            await joplinDataService.putNodeTitle(id, text);
        });

        noteEditor.on("input propertychange", async (event) => {
            const text = event.target.value;
            await joplinDataService.putNoteBody(id, text);
        });

        notebookSelect.on("change", async () => {
            const notebookId = notebookSelect.val();
            await joplinDataService.putNoteParentId(id, notebookId);
        });
    }

    forceRedraw() {
        /*
          https://bugs.chromium.org/p/chromium/issues/detail?id=971701
       */
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
    }

    showError(e) {
        if (e.type === "ConnectionFailed") {
            this.show(PopupView.JOPLIN_UNAVAILABLE_VIEW);
        } else {
            this.show(PopupView.ERROR_PANEL_VIEW);
            $("#errorMessage").text(e.stack);
        }
    }

    async upsertNote() {
        const {
            joplinDataService,
        } = this;

        if (this.noteCreated) {
            await joplinDataService.putNoteBody(this.noteId, this.noteContent);
        } else {
            await joplinDataService.createNote(
                this.noteId,
                this.selectedNotebookId,
                this.noteTitle,
                this.noteContent,
                this.tagId,
            );

            if (hasValue(this.tagId)) {
                await joplinDataService.setNoteTagId(this.noteId, this.tagId);
            }

            this.noteCreated = true;
        }
    }
}
