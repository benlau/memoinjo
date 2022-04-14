import JoplinDataApi from "./joplindataapi.js";
import Renderer from "./renderer.js";
import StorageService from "./services/storageservice.js";
import {
    normalizeLink, hasValue, urlToId,
    hasNoValue, getSelectedNotebookId,
} from "./helper.js";
import "./lib/jquery.textarea_autosize.js";
import BrowserService from "./browserservice.js";

const titleInput = $("#titleInput");
const wizard = $("#wizard");
const noteEditor = $("#noteEditor");
const notebookSelect = $("#notebookSelect");
const launchButtonLink = $("#launchButtonLink");
const editor = $("#editor");

const joplin = new JoplinDataApi();
const renderer = new Renderer();
const browserService = new BrowserService();
const storageService = new StorageService();

async function showNotebooks(notebooks) {
    notebooks.forEach((notebook) => {
        const pad = "&nbsp;&nbsp;&nbsp;&nbsp;";
        const notebookTitle = notebook.title.padStart(
            notebook.level * pad.length + notebook.title.length,
            pad,
        );
        notebookSelect.append(`<option value="${notebook.id}">${notebookTitle}</option>`);
    });
}

async function launchEditor() {
    const [currentTab] = await browserService.queryTabs({ active: true, currentWindow: true });
    const {
        title,
    } = currentTab;
    const url = normalizeLink(currentTab.url);

    titleInput.val(title);
    editor.removeClass("d-none");

    const id = await urlToId(url);

    const notebooks = await joplin.getNotebooks();

    const joplinLink = `joplin://x-callback-url/openNote?id=${id}`;
    launchButtonLink.attr("href", joplinLink);

    const tag = await storageService.getTag() ?? "";
    const tagId = hasValue(tag) ? await joplin.getOrCreateTag(tag) : "";

    await showNotebooks(notebooks);

    let note = await joplin.getNode(id);
    if (note === undefined) {
        const parentId = await getSelectedNotebookId(notebooks);
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
    $(editor).removeClass("disabled");
    noteEditor.trigger("focus");
}

function forceRedraw() {
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

async function start() {
    try {
        await joplin.load();
        if (hasNoValue(joplin.apiToken)) {
            wizard.removeClass("d-none");
            await joplin.requestPermission();
            wizard.addClass("d-none");
        }
        await launchEditor();
    } catch (e) {
        editor.addClass("d-none");
        if (e.type === "ConnectionFailed") {
            $("#joplinWebClipperNotAvailable").removeClass("d-none");
        } else {
            $("#errorPanel").removeClass("d-none");
            $("#errorMessage").text(e.stack);
        }
    }
    forceRedraw();
}

start();
