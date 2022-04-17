import "./lib/jquery.textarea_autosize.js";
import BrowserService from "./services/browserservice.js";
import JoplinDataService from "./services/joplindataservice.js";
import PopupView from "./views/popupview.js";

const joplinService = new JoplinDataService();
const browserService = new BrowserService();
const popupView = new PopupView(
    joplinService,
    browserService,
);

popupView.mount();
popupView.start();
