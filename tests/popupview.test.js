import BrowserService from "../packages/memoinjo-core/services/browserservice.js";
import JoplinDataService from "../packages/memoinjo-core/services/joplindataservice.js";
import StorageService from "../packages/memoinjo-core/services/storageservice.js";
import PopupView from "../packages/memoinjo-core/views/popupview.js";

jest.mock("../packages/memoinjo-core/services/joplindataservice.js");
jest.mock("../packages/memoinjo-core/services/storageservice.js");
jest.mock("../packages/memoinjo-core/services/browserservice.js");

function createPopupView() {
    const joplinDataService = new JoplinDataService();
    const browserService = new BrowserService();
    joplinDataService.storageService = new StorageService();
    const popupView = new PopupView(joplinDataService, browserService);
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
    popupView.browserService.queryTabs.mockReturnValue([
        {
            title: "",
            url: "http://github.com",
        },
    ]);

    popupView.joplinDataService.getNotebooks.mockReturnValue({
        notebooks: [],
        selectedNotebookId: "",
    });

    popupView.joplinDataService.getNote.mockReturnValue({});

    popupView.joplinDataService.storageService.getTemplate.mockReturnValue("");

    popupView.mount();
    await popupView.load();
});
