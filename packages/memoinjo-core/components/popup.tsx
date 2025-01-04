import React from "react";
import "../lib/bower_components/bootstrap.min.css";
import "../lib/bower_components/mdi/css/materialdesignicons.min.css";
import "../popup.css";

import "../lib/jquery.textarea_autosize";
import BrowserService from "../services/browserservice";
import JoplinDataService from "../services/joplindataservice";
import PopupService from "../services/popupservice";
import PopupView from "../views/popupview";

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

const Popup: React.FC = () => {
    usePopup();
    return (
        <div id="popup">
            <div id="loading-view">
                <div className="loading-bar mt-4"></div>
                <div className="loading-bar mt-3"></div>
                <div className="loading-editor mt-3"></div>
            </div>
            <div id="wizard-view" className="d-none">
                <h2>Permission Needed</h2>
                <p>
                    To access your data in Joplin, it needs your authorization.
                    Please
                    <a href="joplin://x-callback-url/openNote?id=none">
                        open
                    </a>{" "}
                    the Joplin desktop application and grant the permission.
                </p>
            </div>
            <div id="joplin-web-clipper-error-view" className="d-none">
                <h2>Unable to connect to Joplin Web Clipper</h2>
                <p>
                    Please ensure that the Joplin Desktop is started and that
                    the clipper service is enabled in the configuration.
                </p>
                <p className="mt-2">
                    <a href="https://joplinapp.org/clipper/">More info</a>
                </p>
            </div>
            <div id="searching-view" className="d-none"></div>
            <div id="editor-view" className="d-none"></div>
            <div id="error-view" className="d-none">
                <h2 className="mb-2">Error</h2>
                <pre>
                    <code id="errorMessage"></code>
                </pre>
            </div>
        </div>
    );
};

export default Popup;
