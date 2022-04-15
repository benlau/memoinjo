import {
    hasNoValue,
} from "./helper.js";
import "./lib/jquery.textarea_autosize.js";
import BrowserService from "./browserservice.js";
import JoplinDataService from "./services/joplindataservice.js";
import PopupView from "./views/popupview.js";

const titleInput = $("#titleInput");
const wizard = $("#wizard");
const noteEditor = $("#noteEditor");
const notebookSelect = $("#notebookSelect");
const launchButtonLink = $("#launchButtonLink");
const editor = $("#editor");

const joplinService = new JoplinDataService();
const browserService = new BrowserService();
const popupView = new PopupView(
    joplinService,
    browserService,
    {
        notebookSelect, editor, titleInput, launchButtonLink, noteEditor,
    },
);

async function start() {
    try {
        await joplinService.load();
        if (hasNoValue(joplinService.apiToken)) {
            wizard.removeClass("d-none");
            await joplinService.requestPermission();
            wizard.addClass("d-none");
        }
        await popupView.launchEditor();
    } catch (e) {
        editor.addClass("d-none");
        if (e.type === "ConnectionFailed") {
            $("#joplinWebClipperNotAvailable").removeClass("d-none");
        } else {
            $("#errorPanel").removeClass("d-none");
            $("#errorMessage").text(e.stack);
        }
    }
    popupView.forceRedraw();
}

start();
