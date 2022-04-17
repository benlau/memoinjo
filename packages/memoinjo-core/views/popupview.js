import {
    normalizeLink,
    hasNoValue,
} from "../helper.js";
import Renderer from "../renderer.js";
import EditorView from "./editorview.js";

export default class PopupView {
    static WIZARD_VIEW = "#wizard-view";

    static JOPLIN_UNAVAILABLE_VIEW = "#joplin-web-clipper-error-view";

    static ERROR_PANEL_VIEW = "#error-view";

    static EDITOR_VIEW = "#editor-view";

    static LOADING_VIEW = "#loading-view";

    constructor(joplinDataService, browserService) {
        this.browserService = browserService;
        this.joplinDataService = joplinDataService;
        this.renderer = new Renderer();
        this.mainEditorView = new EditorView(joplinDataService);
    }

    mount() {
        const ids = [
            PopupView.WIZARD_VIEW,
            PopupView.JOPLIN_UNAVAILABLE_VIEW,
            PopupView.ERROR_PANEL_VIEW,
            PopupView.EDITOR_VIEW,
            PopupView.LOADING_VIEW,
        ];
        this.views = ids.map((id) => ({
            key: id,
            value: $(id),
        })).reduce((arr, item) => {
            // eslint-disable-next-line
            arr[item.key] = item.value;
            return arr;
        }, {});

        this.editorView = this.views[PopupView.EDITOR_VIEW];
    }

    async start() {
        const {
            joplinDataService,
        } = this;
        try {
            await joplinDataService.load();
            if (hasNoValue(joplinDataService.apiToken)) {
                this.show(PopupView.WIZARD_VIEW);
                await joplinDataService.requestPermission();
                this.show(PopupView.LOADING_VIEW);
            }
            await this.load();
            this.show(PopupView.EDITOR_VIEW);
            this.mainEditorView.mount(this.editorView);
        } catch (e) {
            this.showError(e);
        }
        this.forceRedraw();
    }

    show(view) {
        Object.entries(this.views).forEach(([key, value]) => {
            if (key === view) {
                value.removeClass("d-none");
            } else {
                value.addClass("d-none");
            }
        });
    }

    async load() {
        const {
            browserService,
        } = this;

        const [currentTab] = await browserService.queryTabs({ active: true, currentWindow: true });
        const {
            title,
        } = currentTab;
        const url = normalizeLink(currentTab.url);
        await this.mainEditorView.load(url, title);
    }

    forceRedraw() {
        /*
          https://bugs.chromium.org/p/chromium/issues/detail?id=971701
        */
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
    }

    showError(e) {
        if (e.type === "ConnectionFailed") {
            this.show(PopupView.JOPLIN_UNAVAILABLE_VIEW);
        } else {
            this.show(PopupView.ERROR_PANEL_VIEW);
            $("#errorMessage").text(e.stack);
        }
    }
}
