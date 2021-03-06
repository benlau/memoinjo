import JoplinDataService from "../packages/memoinjo-core/services/joplindataservice.js";

jest.mock("../packages/memoinjo-core/services/storageservice.js");

beforeEach(() => {
    fetch.resetMocks();
});

test("JoplinDataService.constructor", () => {
    const api = new JoplinDataService();
    expect(api.apiUrl).toBe("http://localhost:41184");
});

test("JoplinDataService.getNotebooks", async () => {
    const data = {
        result: "ok",
        items: [
            { id: "0", parent_id: "1", title: "0" },
            { id: "1", parent_id: "", title: "1" },
            { id: "2", parent_id: "", title: "2" },
        ],
    };

    fetch.mockResponseOnce(JSON.stringify(data));

    const expectedOutput = [
        {
            id: "1",
            title: "1",
            level: 0,
        },
        {
            id: "0",
            title: "0",
            level: 1,
        },
        {
            id: "2",
            title: "2",
            level: 0,
        },
    ];

    const api = new JoplinDataService();
    const { notebooks } = await api.getNotebooks();

    expect(notebooks).toStrictEqual(expectedOutput);
});

test("JoplinDataService.getNotebooks should sort", async () => {
    const data = {
        result: "ok",
        items: [
            { id: "2", parent_id: "", title: "2" },
            { id: "0", parent_id: "1", title: "0" },
            { id: "1", parent_id: "", title: "1" },
        ],
    };

    fetch.mockResponseOnce(JSON.stringify(data));

    const expectedOutput = [
        {
            id: "1",
            title: "1",
            level: 0,
        },
        {
            id: "0",
            title: "0",
            level: 1,
        },
        {
            id: "2",
            title: "2",
            level: 0,
        },
    ];

    const api = new JoplinDataService();
    const { notebooks } = await api.getNotebooks();

    expect(notebooks).toStrictEqual(expectedOutput);
});
