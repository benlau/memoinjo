import BrowserService from "../packages/memoinjo-core/browserservice.js";
import JoplinDataService from "../packages/memoinjo-core/services/joplindataservice.js";
import PopupView from "../packages/memoinjo-core/views/popupview.js";

function createPopupView() {
    const joplinDataService = new JoplinDataService();
    const browserService = new BrowserService();
    const popupView = new PopupView(joplinDataService, browserService);
    return popupView;
}

test("PopupView.setup", () => {
    const popupView = createPopupView();
    expect(popupView.views).toBe(undefined);
    popupView.setup();
    expect(popupView.views).not.toBe(undefined);
});

test("PopupView.show", () => {
    const popupView = createPopupView();
    popupView.setup();
    popupView.show(PopupView.EDITOR_VIEW);
});
