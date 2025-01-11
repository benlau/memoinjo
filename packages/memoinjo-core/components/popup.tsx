import React from "react";
import "../lib/bower_components/bootstrap.min.css";
import "../lib/bower_components/mdi/css/materialdesignicons.min.css";
import "../popup.css";

import BrowserService from "../services/browserservice";
import JoplinDataService from "../services/joplindataservice";
import PopupService from "../services/popupservice";
import { PopupView } from "../views/popupview";

const Popup: React.FC = () => {
    const joplinService = React.useMemo(() => new JoplinDataService(), []);
    const browserService = React.useMemo(() => new BrowserService(), []);
    const popupService = React.useMemo(
        () => new PopupService(joplinService, browserService),
        [joplinService, browserService],
    );

    return <PopupView popupService={popupService} />;
};

export default Popup;
