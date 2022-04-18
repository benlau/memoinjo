import BrowserService from "../packages/memoinjo-core/services/browserservice.js";
import JoplinDataService from "../packages/memoinjo-core/services/joplindataservice.js";
import PopupService from "../packages/memoinjo-core/services/popupservice.js";
import StorageService from "../packages/memoinjo-core/services/storageservice.js";
import PopupView from "../packages/memoinjo-core/views/popupview.js";

jest.mock("../packages/memoinjo-core/services/joplindataservice.js");
jest.mock("../packages/memoinjo-core/services/storageservice.js");
jest.mock("../packages/memoinjo-core/services/browserservice.js");
jest.mock("../packages/memoinjo-core/services/popupservice.js");

function createPopupView() {
    const joplinDataService = new JoplinDataService();
    const browserService = new BrowserService();
    joplinDataService.storageService = new StorageService();
    const popupService = new PopupService(joplinDataService, browserService);
    popupService.joplinDataService = joplinDataService;
    popupService.browserService = browserService;

    const popupView = new PopupView(popupService);
    return popupView;
}

test("PopupView.mount should create set views attribute", () => {
    const popupView = createPopupView();
    expect(popupView.views).toBe(undefined);
    popupView.mount();
    expect(popupView.views).not.toBe(undefined);
});

test("PopupView.show", () => {
    const popupView = createPopupView();
    popupView.mount();
    popupView.show(PopupView.EDITOR_VIEW);
});

test("PopupView.load", async () => {
    const popupView = createPopupView();
    popupView.popupService.currentTab = {
        url: "http://github.com",
        id: "",
        title: "",
    };
    popupView.popupService.joplinDataService.storageService.getTemplate.mockReturnValue("");
    await popupView.load();
});
