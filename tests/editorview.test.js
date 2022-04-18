import JoplinDataService from "../packages/memoinjo-core/services/joplindataservice.js";
import StorageService from "../packages/memoinjo-core/services/storageservice.js";
import EditorView from "../packages/memoinjo-core/views/editorview.js";
import PopupService from "../packages/memoinjo-core/services/popupservice.js";
import BrowserService from "../packages/memoinjo-core/services/browserservice.js";

jest.mock("../packages/memoinjo-core/services/joplindataservice.js");
jest.mock("../packages/memoinjo-core/services/storageservice.js");
jest.mock("../packages/memoinjo-core/services/browserservice.js");

function createEditorView() {
    const joplinDataService = new JoplinDataService();
    const browserService = new BrowserService();
    joplinDataService.storageService = new StorageService();
    const popupService = new PopupService(joplinDataService, browserService);

    const editorView = new EditorView(popupService);
    return editorView;
}

test("EditorView.upsertNote should set noteAvailable to true", async () => {
    const editorView = createEditorView();
    expect(editorView.noteContent).toBe("");
    expect(editorView.noteAvailable).toBe(false);

    editorView.tagId = "tagId";

    await editorView.upsertNote();

    expect(editorView.noteAvailable).toBe(true);
    expect(editorView.popupService.joplinDataService.createNote.mock.calls.length).toBe(1);
    expect(editorView.popupService.joplinDataService.setNoteTagId.mock.calls.length).toBe(1);
});

test("EditorView.upsertNote when noteAvailable is false", async () => {
    const editorView = createEditorView();
    editorView.noteAvailable = true;

    await editorView.upsertNote();

    expect(editorView.popupService.joplinDataService.putNoteTitleBody.mock.calls.length).toBe(1);
});

test("EditorView.load", async () => {
    const editorView = createEditorView();

    editorView.popupService.joplinDataService.getNote.mockReturnValue({});

    editorView.popupService.joplinDataService.storageService.getTemplate.mockReturnValue("");

    await editorView.load();
});
