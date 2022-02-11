import Constants from "./constants.js";

export default class Storage {
    static ApiToken = "ApiToken";

    static AuthToken = "AuthToken";

    static Template = "Template";

    static Tag = "Tag";

    static SelectedNotebookId = "SelectedNotebookId";

    static async get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key]);
            });
        });
    }

    static async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve();
            });
        });
    }

    static async getTemplate() {
        return await Storage.get(Storage.Template) ?? Constants.DefaultTemplateValue;
    }

    static async getTag() {
        return await Storage.get(Storage.Tag) ?? Constants.DefaultTagValue;
    }
}
