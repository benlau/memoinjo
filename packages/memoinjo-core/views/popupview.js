import {
    normalizeLink, hasValue, urlToId,
} from "../helper.js";
import Renderer from "../renderer.js";

export default class PopupView {
    static WIZARD_VIEW = "#wizard";

    static JOPLIN_UNAVAILABLE_VIEW = "#joplinWebClipperNotAvailable";

    static ERROR_PANEL_VIEW = "#errorPanel";

    static EDITOR_VIEW = "#editor";

    constructor(joplinDataService, browserService) {
        this.browserService = browserService;
        this.joplinDataService = joplinDataService;
        this.renderer = new Renderer();
    }

    setup() {
        const ids = [
            PopupView.WIZARD_VIEW,
            PopupView.JOPLIN_UNAVAILABLE_VIEW,
            PopupView.ERROR_PANEL_VIEW,
            PopupView.EDITOR_VIEW,
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

    show(view) {
        Object.entries(this.views).forEach(([key, value]) => {
            if (key === view) {
                value.removeClass("d-none");
            } else {
                value.addClass("d-none");
            }
        });
    }

    showNotebooks(notebooks) {
        notebooks.forEach((notebook) => {
            const pad = "&nbsp;&nbsp;&nbsp;&nbsp;";
            const notebookTitle = notebook.title.padStart(
                notebook.level * pad.length + notebook.title.length,
                pad,
            );
            this.notebookSelect.append(`<option value="${notebook.id}">${notebookTitle}</option>`);
        });
    }

    async launchEditor() {
        const {
            titleInput, browserService, renderer, joplinDataService,
            noteEditor, notebookSelect, launchButtonLink,
        } = this;
        const { storageService } = joplinDataService;
        const joplin = joplinDataService;

        const [currentTab] = await browserService.queryTabs({ active: true, currentWindow: true });
        const {
            title,
        } = currentTab;
        const url = normalizeLink(currentTab.url);

        titleInput.val(title);
        this.show(PopupView.EDITOR_VIEW);

        const id = await urlToId(url);

        const {
            notebooks,
            selectedNotebookId,
        } = await joplin.getNotebooks();

        const joplinLink = `joplin://x-callback-url/openNote?id=${id}`;
        launchButtonLink.attr("href", joplinLink);

        const tag = await storageService.getTag() ?? "";
        const tagId = hasValue(tag) ? await joplin.getOrCreateTag(tag) : "";

        this.showNotebooks(notebooks);

        let note = await joplin.getNode(id);
        if (note === undefined) {
            const parentId = selectedNotebookId;
            renderer.template = await storageService.getTemplate();
            const body = renderer.render({
                url, tag, tagId, title,
            });
            note = await joplin.createNode(id, parentId, title, body, tagId);
            if (hasValue(tagId)) {
                await joplin.setNoteTagId(note.id, tagId);
            }
        }
        notebookSelect.val(note.parent_id);

        titleInput.val(note.title);
        titleInput.on("input propertychange", async (event) => {
            const text = event.target.value;
            await joplin.putNodeTitle(id, text);
        });

        noteEditor.textareaAutoSize();
        noteEditor.val(note.body).trigger("input");
        noteEditor.on("input propertychange", async (event) => {
            const text = event.target.value;
            await joplin.putNoteBody(id, text);
        });

        notebookSelect.on("change", async () => {
            const notebookId = notebookSelect.val();
            await joplin.putNoteParentId(note.id, notebookId);
        });

        [titleInput, notebookSelect, noteEditor].forEach((elem) => {
            elem.prop("disabled", false);
        });
        this.editorView.removeClass("disabled");
        noteEditor.trigger("focus");
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
}
