import {
    normalizeLink, hasValue,
    hasNoValue,
} from "../helper.js";
import Renderer from "../renderer.js";

export default class PopupView {
    static WIZARD_VIEW = "#wizard-view";

    static JOPLIN_UNAVAILABLE_VIEW = "#joplin-web-clipper-error-view";

    static ERROR_PANEL_VIEW = "#error-view";

    static EDITOR_VIEW = "#editor-view";

    static LOADING_VIEW = "#loading-view";

    constructor(joplinDataService, browserService) {
        this.browserService = browserService;
        this.joplinDataService = joplinDataService;
        this.renderer = new Renderer();

        this.noteId = "";
        this.noteContent = "";
        this.noteAvailable = false;
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
        this.noteEditor = $("#note-editor");
        this.titleInput = $("#title-input");
        this.notebookSelect = $("#notebook-select");
        this.openJoplinLink = $("#open-in-joplin-link");
        this.createNoteLink = $("#create-button-link");
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

        const [currentTab] = await browserService.queryTabs({ active: true, currentWindow: true });
        const {
            title,
        } = currentTab;
        const url = normalizeLink(currentTab.url);
        const id = await joplinDataService.urlToId(url);
        this.noteId = id;

        const {
            notebooks,
            selectedNotebookId,
        } = await joplinDataService.getNotebooks();

        this.notebooks = notebooks;

        const tag = await storageService.getTag() ?? "";
        const tagId = hasValue(tag) ? await joplinDataService.getOrCreateTag(tag) : "";
        this.tagId = tagId;

        const note = await joplinDataService.getNote(id);
        if (note === undefined) {
            renderer.template = await storageService.getTemplate();
            this.selectedNotebookId = selectedNotebookId;
            this.noteTitle = currentTab.title;
            this.noteContent = renderer.render({
                url, tag, tagId, title,
            });
            this.noteAvailable = false;
        } else {
            this.selectedNotebookId = note.parent_id;
            this.noteTitle = note.title;
            this.noteContent = note.body;
            this.noteAvailable = true;
            this.onNoteAvailable();
        }
    }

    refresh() {
        const {
            titleInput,
            noteEditor, notebookSelect, openJoplinLink,
        } = this;

        titleInput.val(this.noteTitle);

        const joplinLink = `joplin://x-callback-url/openNote?id=${this.noteId}`;
        openJoplinLink.attr("href", joplinLink);

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
            this.noteTitle = text;
            await this.upsertNote();
        });

        noteEditor.on("input propertychange", async (event) => {
            const text = event.target.value;
            this.noteContent = text;
            await this.upsertNote();
        });

        notebookSelect.on("change", async () => {
            const notebookId = notebookSelect.val();
            await this.upsertNote();
            await joplinDataService.putNoteParentId(id, notebookId);
        });

        $("#create-button-link").on("click", async () => {
            await this.upsertNote();
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

        if (this.noteAvailable) {
            await joplinDataService.putNoteTitleBody(this.noteId, this.noteTitle, this.noteContent);
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

            this.noteAvailable = true;
            this.onNoteAvailable();
        }
    }

    onNoteAvailable() {
        this.openJoplinLink.removeClass("d-none");
        this.createNoteLink.addClass("d-none");
    }
}
