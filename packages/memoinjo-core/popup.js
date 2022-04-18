import "./lib/jquery.textarea_autosize.js";
import BrowserService from "./services/browserservice.js";
import JoplinDataService from "./services/joplindataservice.js";
import PopupService from "./services/popupservice.js";
import PopupView from "./views/popupview.js";

const joplinService = new JoplinDataService();
const browserService = new BrowserService();
const popupService = new PopupService(
    joplinService,
    browserService,
);
const popupView = new PopupView(
    popupService,
);

popupView.mount();
popupView.start();
