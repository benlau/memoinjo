import BrowserService from "../packages/memoinjo-core/browserservice.js";
import JoplinDataService from "../packages/memoinjo-core/services/joplindataservice.js";
import PopupView from "../packages/memoinjo-core/views/popupview.js";

function createPopupView() {
    const joplinDataService = new JoplinDataService();
    const browserService = new BrowserService();
    const popupView = new PopupView(joplinDataService, browserService);
    return popupView;
}

test("PopupView.initialize should create set views attribute", () => {
    const popupView = createPopupView();
    expect(popupView.views).toBe(undefined);
    popupView.initialize();
    expect(popupView.views).not.toBe(undefined);
});

test("PopupView.show", () => {
    const popupView = createPopupView();
    popupView.initialize();
    popupView.show(PopupView.EDITOR_VIEW);
});
