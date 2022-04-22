import Renderer from "../renderer.js";

export default class EditorView {
    constructor(popupService) {
        this.popupService = popupService;
        this.noteId = "";
        this.noteTitle = "";
        this.noteAvailable = false;
        this.noteContent = "";
        this.notebookId = "";
        this.renderer = new Renderer();
    }

    mount(parent) {
        const {
            joplinDataService,
            notebooks,
        } = this.popupService;

        const html = `
        <div id="button-bar" class="text-start d-flex justify-content-between">
            <a id="create-note-link" href="#">Create</a>
            <a id="open-in-joplin-link" href="#" class="d-none">Open in Joplin</a>
            <a id="search-link" href="#" class="d-none">
                <i class="fab fa-searchengin"></i>
            </a>
        </div>

        <select id="notebook-select" class="form-select form-select-sm mb-2">
        </select>

        <input class="form-control" id="title-input" placeholder="">

        <textarea class="form-control" id="note-editor"></textarea>
        `;

        $(parent).html(html);

        const noteEditor = $("#note-editor");
        const titleInput = $("#title-input");
        const notebookSelect = $("#notebook-select");
        const openJoplinLink = $("#open-in-joplin-link");
        const createNoteLink = $("#create-note-link");

        const joplinLink = `joplin://x-callback-url/openNote?id=${this.noteId}`;
        openJoplinLink.attr("href", joplinLink);

        titleInput.val(this.noteTitle);

        noteEditor.textareaAutoSize();
        noteEditor.val(this.noteContent).trigger("input");

        notebooks.forEach((notebook) => {
            const pad = "&nbsp;&nbsp;&nbsp;&nbsp;";
            const notebookTitle = notebook.title.padStart(
                notebook.level * pad.length + notebook.title.length,
                pad,
            );
            notebookSelect.append(`<option value="${notebook.id}">${notebookTitle}</option>`);
        });
        notebookSelect.val(this.notebookId);

        if (this.noteAvailable) {
            this.setOpenJoplinLinkVisible();
        }

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
            await joplinDataService.putNoteParentId(this.noteId, notebookId);
        });

        createNoteLink.on("click", async () => {
            await this.upsertNote();
        });

        noteEditor.trigger("focus");
    }

    async load() {
        const {
            popupService,
            renderer,
        } = this;
        const {
            joplinDataService,
        } = popupService;
        const {
            storageService,
        } = joplinDataService;

        const noteId = popupService.currentTab.id;
        this.noteId = noteId;

        const {
            selectedNotebookId,
        } = popupService;

        const note = await joplinDataService.getNote(noteId);
        if (note === undefined) {
            renderer.template = await storageService.getTemplate();
            this.notebookId = selectedNotebookId;
            this.noteTitle = popupService.currentTab.title;
            const {
                url,
                title,
            } = popupService.currentTab;
            const {
                tag,
                tagId,
            } = popupService;
            this.noteContent = renderer.render({
                url, tag, tagId, title,
            });
            this.noteAvailable = false;
        } else {
            this.notebookId = note.parent_id;
            this.noteTitle = note.title;
            this.noteContent = note.body;
            this.noteAvailable = true;
        }
    }

    async upsertNote() {
        const {
            popupService,
            noteAvailable,
        } = this;

        await popupService.upsertNote(this.noteId, this.noteTitle, this.noteContent, noteAvailable);
        if (!noteAvailable) {
            this.noteAvailable = true;
            this.setOpenJoplinLinkVisible();
        }
    }

    setOpenJoplinLinkVisible() {
        const openJoplinLink = $("#open-in-joplin-link");
        const createNoteLink = $("#create-note-link");

        openJoplinLink.removeClass("d-none");
        createNoteLink.addClass("d-none");
    }
}
