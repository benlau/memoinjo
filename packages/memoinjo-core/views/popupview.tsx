import { hasNoValue } from "../helper.js";
import { EditorView } from "./editorview";
import { SearchingView } from "./searchingview.js";
import PopupService from "../services/popupservice.js";
import React from "react";

const WIZARD_VIEW = "#wizard-view";
const JOPLIN_UNAVAILABLE_VIEW = "#joplin-web-clipper-error-view";
const ERROR_PANEL_VIEW = "#error-view";
const EDITOR_VIEW = "#editor-view";
const LOADING_VIEW = "#loading-view";
const SEARCHING_VIEW = "#searching-view";

export type Props = {
    popupService: PopupService;
};

export function PopupView({ popupService }: Props) {
    const [view, setView] = React.useState(LOADING_VIEW);
    const [error, setError] = React.useState(null);

    const show = React.useCallback((view) => {
        setView(view);
    }, []);

    const showError = React.useCallback(
        (e) => {
            if (e.type === "ConnectionFailed") {
                show(JOPLIN_UNAVAILABLE_VIEW);
            } else {
                show(ERROR_PANEL_VIEW);
                setError(e);
            }
        },
        [show],
    );

    const onSearchClicked = React.useCallback(() => {
        show(SEARCHING_VIEW);
    }, [show]);

    const forceRedraw = React.useCallback(() => {
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
    }, []);

    const onBackClicked = React.useCallback(() => {
        show(EDITOR_VIEW);
    }, [show]);

    const load = React.useCallback(async () => {
        await popupService.load();
    }, [popupService]);

    React.useEffect(() => {
        const start = async () => {
            const { joplinDataService } = popupService;
            try {
                await joplinDataService.load();
                if (hasNoValue(joplinDataService.apiToken)) {
                    show(WIZARD_VIEW);
                    await joplinDataService.requestPermission();
                    show(LOADING_VIEW);
                }
                await load();
                show(EDITOR_VIEW);
            } catch (e) {
                showError(e);
            }
            forceRedraw();
        };

        start();
    }, [popupService, show, showError, load, forceRedraw]);

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

            {view === SEARCHING_VIEW && (
                <SearchingView
                    popupService={popupService}
                    onBackClicked={onBackClicked}
                />
            )}

            {view === EDITOR_VIEW && (
                <EditorView
                    popupService={popupService}
                    onSearchClicked={onSearchClicked}
                />
            )}

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
