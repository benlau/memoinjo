import Constants from "../constants";

export default class StorageService {
    static ApiToken = "ApiToken";

    static AuthToken = "AuthToken";

    static Template = "Template";

    static Tag = "Tag";

    static SelectedNotebookId = "SelectedNotebookId";

    constructor() {}

    async get(key: string): Promise<string | number | null> {
        return new Promise((resolve) => {
            // Firefox works
            chrome.storage.local.get([key], (result) => {
                resolve(result[key]);
            });
        });
    }

    async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve(value);
            });
        });
    }

    async getTemplate(): Promise<string> {
        return (
            ((await this.get(StorageService.Template)) as string) ??
            Constants.DefaultTemplateValue
        );
    }

    async getTag(): Promise<string> {
        return (
            ((await this.get(StorageService.Tag)) as string) ??
            Constants.DefaultTagValue
        );
    }
}
