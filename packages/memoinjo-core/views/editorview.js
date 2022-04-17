import {
    hasValue,
} from "../helper.js";
import Renderer from "../renderer.js";

export default class EditorView {
    constructor(joplinDataService) {
        this.noteId = "";
        this.noteTitle = "";
        this.noteAvailable = false;
        this.noteContent = "";
        this.notebooks = [];
        this.tagId = "";
        this.selectedNotebookId = "";
        this.joplinDataService = joplinDataService;
        this.renderer = new Renderer();
    }

    mount(parent) {
        const {
            joplinDataService,
            notebooks,
        } = this;

        const html = `
        <div id="button-bar" class="text-start">
            <a id="create-note-link" href="#">Create</a>
            <a id="open-in-joplin-link" href="#" class="d-none">Open in Joplin</a>
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

        notebookSelect.val(this.selectedNotebookId);

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

        titleInput.val(this.noteTitle);

        noteEditor.trigger("focus");
    }

    async load(url, pageTitle) {
        const {
            joplinDataService,
            renderer,
        } = this;
        const {
            storageService,
        } = joplinDataService;

        const noteId = await joplinDataService.urlToId(url);
        this.noteId = noteId;

        const {
            notebooks,
            selectedNotebookId,
        } = await joplinDataService.getNotebooks();

        this.notebooks = notebooks;

        const tag = await storageService.getTag() ?? "";
        const tagId = hasValue(tag) ? await joplinDataService.getOrCreateTag(tag) : "";
        this.tagId = tagId;

        const note = await joplinDataService.getNote(noteId);
        if (note === undefined) {
            renderer.template = await storageService.getTemplate();
            this.selectedNotebookId = selectedNotebookId;
            this.noteTitle = pageTitle;
            this.noteContent = renderer.render({
                url, tag, tagId, pageTitle,
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
        const openJoplinLink = $("#open-in-joplin-link");
        const createNoteLink = $("#create-note-link");

        openJoplinLink.removeClass("d-none");
        createNoteLink.addClass("d-none");
    }
}
