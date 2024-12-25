import "./lib/bower_components/bootstrap.min.css";
import "./lib/bower_components/mdi/css/materialdesignicons.min.css";
import "./popup.css";

import "./lib/jquery.textarea_autosize";
import BrowserService from "./services/browserservice";
import JoplinDataService from "./services/joplindataservice";
import PopupService from "./services/popupservice";
import PopupView from "./views/popupview";

const joplinService = new JoplinDataService();
const browserService = new BrowserService();
const popupService = new PopupService(joplinService, browserService);
const popupView = new PopupView(popupService);

popupView.mount();
popupView.start();
