import {
    hasNoValue,
} from "./helper.js";
import "./lib/jquery.textarea_autosize.js";
import BrowserService from "./browserservice.js";
import JoplinDataService from "./services/joplindataservice.js";
import PopupView from "./views/popupview.js";

const wizard = $("#wizard");

const joplinService = new JoplinDataService();
const browserService = new BrowserService();
const popupView = new PopupView(
    joplinService,
    browserService,
);

async function start() {
    popupView.setup();
    try {
        await joplinService.load();
        if (hasNoValue(joplinService.apiToken)) {
            wizard.removeClass("d-none");
            await joplinService.requestPermission();
            wizard.addClass("d-none");
        }
        await popupView.launchEditor();
    } catch (e) {
        popupView.showError(e);
    }
    popupView.forceRedraw();
}

start();
