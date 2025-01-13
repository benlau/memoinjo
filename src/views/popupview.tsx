import React from "react";
import {
    EDITOR_VIEW,
    ERROR_PANEL_VIEW,
    JOPLIN_UNAVAILABLE_VIEW,
    LOADING_VIEW,
    SEARCHING_VIEW,
    usePopupContext,
    WIZARD_VIEW,
} from "../contexts/popupcontext";
import { EditorView } from "./editorview";
import { SearchingView } from "./searchingview.js";
import "./popup.css";

export function PopupView() {
    const { view, error } = usePopupContext();

    return (
        <div id="popup">
            {view === LOADING_VIEW && (
                <div id="loading-view">
                    <div className="loading-bar mt-4"></div>
                    <div className="loading-bar mt-3"></div>
                    <div className="loading-editor mt-3"></div>
                </div>
            )}
            {view === WIZARD_VIEW && (
                <>
                    <div id="wizard-view">
                        <h2>Permission Needed</h2>
                        <p>
                            To access your data in Joplin, it needs your
                            authorization. Please{" "}
                            <a
                                href="joplin://x-callback-url/openNote?id=none"
                                className="text-blue-500 underline"
                            >
                                open
                            </a>{" "}
                            the Joplin desktop application and grant the
                            permission.
                        </p>
                    </div>
                </>
            )}
            {view === JOPLIN_UNAVAILABLE_VIEW && (
                <>
                    <div id="joplin-web-clipper-error-view">
                        <h2>Unable to connect to Joplin Web Clipper</h2>
                        <p>
                            Please ensure that the Joplin Desktop is started and
                            that the clipper service is enabled in the
                            configuration.
                        </p>
                        <p className="mt-2">
                            <a href="https://joplinapp.org/clipper/">
                                More info
                            </a>
                        </p>
                    </div>
                </>
            )}
            {view === SEARCHING_VIEW && <SearchingView />}
            {view === EDITOR_VIEW && <EditorView />}
            {view === ERROR_PANEL_VIEW && (
                <>
                    <div id="error-view">
                        <h2 className="mb-2">Error</h2>
                        <pre>
                            <code id="errorMessage">{error}</code>
                        </pre>
                    </div>
                </>
            )}
        </div>
    );
}
