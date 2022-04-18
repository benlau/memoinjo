import {
    normalizeLink,
    hasValue,
} from "../helper.js";

export default class PopupService {
    constructor(joplinDataService, browserService) {
        this.joplinDataService = joplinDataService;
        this.browserService = browserService;
        this.tagId = "";
        this.tag = "";
        this.selectedNotebookId = "";
        this.currentTab = {
            title: "",
            url: "",
            id: "",
        };
        this.notebooks = [];
    }

    async load() {
        const {
            browserService,
            joplinDataService,
        } = this;
        const {
            storageService,
        } = joplinDataService;

        const [currentTab] = await browserService.queryTabs({ active: true, currentWindow: true });
        const {
            title,
        } = currentTab;
        const url = normalizeLink(currentTab.url);
        this.currentTab = {
            url,
            title,
            id: await joplinDataService.urlToId(url),
        };

        const tag = await storageService.getTag() ?? "";
        const tagId = hasValue(tag) ? await joplinDataService.getOrCreateTag(tag) : "";

        this.tagId = tagId;
        this.tag = tag;

        const {
            notebooks,
            selectedNotebookId,
        } = await joplinDataService.getNotebooks();

        this.notebooks = notebooks;
        this.selectedNotebookId = selectedNotebookId;
    }

    breakdownUrl(url) {
        const res = [];
        res.push(normalizeLink(url));

        const u = new URL(url);
        u.hash = "";
        u.search = "";
        res.push(u.toString());
        const { pathname } = u;
        const tokens = pathname.split("/");
        tokens.pop();

        while (tokens.length > 0) {
            u.pathname = tokens.join("/");
            res.push(tokens.length > 1 ? u.toString() : u.toString().replace(/\/$/, ""));
            tokens.pop();
        }

        return [...new Set(res)];
    }
}
