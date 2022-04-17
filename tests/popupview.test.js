import BrowserService from "../packages/memoinjo-core/browserservice.js";
import JoplinDataService from "../packages/memoinjo-core/services/joplindataservice.js";
import StorageService from "../packages/memoinjo-core/services/storageservice.js";
import PopupView from "../packages/memoinjo-core/views/popupview.js";

jest.mock("../packages/memoinjo-core/services/joplindataservice.js");
jest.mock("../packages/memoinjo-core/services/storageservice.js");
jest.mock("../packages/memoinjo-core/browserservice.js");

function createPopupView() {
    const joplinDataService = new JoplinDataService();
    const browserService = new BrowserService();
    joplinDataService.storageService = new StorageService();
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

test("PopupView.upsertNote should set noteAvailable to true", async () => {
    const popupView = createPopupView();
    expect(popupView.noteContent).toBe("");
    expect(popupView.noteAvailable).toBe(false);

    popupView.initialize();
    popupView.tagId = "tagId";

    await popupView.upsertNote();

    expect(popupView.noteAvailable).toBe(true);
    expect(popupView.joplinDataService.createNote.mock.calls.length).toBe(1);
    expect(popupView.joplinDataService.setNoteTagId.mock.calls.length).toBe(1);
});

test("PopupView.upsertNote when noteAvailable is false", async () => {
    const popupView = createPopupView();
    popupView.initialize();
    popupView.noteAvailable = true;

    await popupView.upsertNote();

    expect(popupView.joplinDataService.putNoteTitleBody.mock.calls.length).toBe(1);
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

    popupView.initialize();
    await popupView.load();
});
