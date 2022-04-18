import BrowserService from "../packages/memoinjo-core/services/browserservice.js";
import JoplinDataService from "../packages/memoinjo-core/services/joplindataservice.js";
import PopupService from "../packages/memoinjo-core/services/popupservice.js";
import StorageService from "../packages/memoinjo-core/services/storageservice.js";

jest.mock("../packages/memoinjo-core/services/joplindataservice.js");
jest.mock("../packages/memoinjo-core/services/storageservice.js");
jest.mock("../packages/memoinjo-core/services/browserservice.js");

function createPopupService() {
    const joplinDataService = new JoplinDataService();
    joplinDataService.storageService = new StorageService();
    const browserService = new BrowserService();
    const popupService = new PopupService(joplinDataService, browserService);
    return popupService;
}

test("PopupService.load", async () => {
    const popupService = createPopupService();

    popupService.browserService.queryTabs.mockReturnValue([
        {
            title: "",
            url: "http://github.com",
        },
    ]);

    popupService.joplinDataService.getNotebooks.mockReturnValue({
        notebooks: [],
        selectedNotebookId: "",
    });

    popupService.joplinDataService.getNote.mockReturnValue({});

    popupService.joplinDataService.storageService.getTemplate.mockReturnValue("");

    await popupService.load();
});