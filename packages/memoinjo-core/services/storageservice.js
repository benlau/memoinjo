import Constants from "../constants.js";

export default class StorageService {
    static ApiToken = "ApiToken";

    static AuthToken = "AuthToken";

    static Template = "Template";

    static Tag = "Tag";

    static SelectedNotebookId = "SelectedNotebookId";

    constructor(storageRepo) {
        this.storageRepo = storageRepo;
    }

    async get(key) {
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
                resolve();
            });
        });
    }

    async getTemplate() {
        return await this.get(StorageService.Template) ?? Constants.DefaultTemplateValue;
    }

    async getTag() {
        return await this.get(StorageService.Tag) ?? Constants.DefaultTagValue;
    }
}
