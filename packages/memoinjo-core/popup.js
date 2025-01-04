import "./lib/bower_components/bootstrap.min.css";
import "./lib/bower_components/mdi/css/materialdesignicons.min.css";
import "./popup.css";

import "./lib/jquery.textarea_autosize";
import React from "react";
import BrowserService from "./services/browserservice";
import JoplinDataService from "./services/joplindataservice";
import PopupService from "./services/popupservice";
import PopupView from "./views/popupview";

export function usePopup() {
    const joplinService = React.useMemo(() => new JoplinDataService(), []);
    const browserService = React.useMemo(() => new BrowserService(), []);
    const popupService = React.useMemo(
        () => new PopupService(joplinService, browserService),
        [joplinService, browserService],
    );
    const popupView = React.useMemo(
        () => new PopupView(popupService),
        [popupService],
    );

    React.useEffect(() => {
        popupView.mount();
        popupView.start();
    }, [popupView]);
}
