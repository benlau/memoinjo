import StorageService from "./storageservice.js";
import { hasValue, hasNoValue, sha256 } from "../helper.js";

export default class JoplinDataService {
    constructor(storageService = new StorageService()) {
        this.apiToken = undefined;
        this.apiUrl = "http://localhost:41184";
        this.authToken = undefined;
        this.storageService = storageService;
    }

    async load() {
        this.apiToken = await this.storageService.get(StorageService.ApiToken);
        this.authToken = await this.storageService.get(StorageService.AuthToken);
    }

    async fetchData(url, options, body) {
        try {
            return await fetch(url, options, body);
        } catch (e) {
            // eslint-disable-next-line
            console.error(e);
            e.type = "ConnectionFailed";
            throw e;
        }
    }

    async requestAuthToken() {
        const url = `${this.apiUrl}/auth`;
        const response = await this.fetchData(url, {
            method: "POST",
        });
        const json = await response.json();
        this.authToken = json.auth_token;
        await this.storageService.set(StorageService.AuthToken, this.authToken);
    }

    async requestPermission() {
        if (hasValue(this.apiToken)) {
            return;
        }

        if (hasNoValue(this.authToken)) {
            await this.requestAuthToken();
        }

        while (hasNoValue(this.apiToken)) {
            const url = `${this.apiUrl}/auth/check?auth_token=${this.authToken}`;
            const response = await this.fetchData(url, {
                method: "GET",
            });
            if (response.status === 500) {
                await this.requestAuthToken();
                continue;
            }
            const json = await response.json();
            const {
                status,
                token,
            } = json;
            if (status === "accepted") {
                this.apiToken = token;
                this.authToken = undefined;
                await this.storageService.set(StorageService.ApiToken, this.apiToken);
                await this.storageService.set(StorageService.AuthToken, this.authToken);
            }
            if (status === "rejected") {
                await this.requestAuthToken();
            }
            await new Promise((r) => setTimeout(r, 500));
        }
    }

    async getNote(id) {
        // eslint-disable-next-line
        const url = `${this.apiUrl}/notes/${id}?token=${this.apiToken}&fields=id,body,title,parent_id`;
        const response = await this.fetchData(url, {
            method: "GET",
        });
        if (!response.ok) {
            return;
        }
        return response.json();
    }

    async createNote(id, parentId, title, body) {
        const url = `${this.apiUrl}/notes?token=${this.apiToken}`;
        const data = {
            id,
            title,
            body,
            parent_id: parentId,
        };
        const response = await this.fetchData(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        return response.json();
    }

    async putNoteTitle(id, title) {
        const data = {
            title,
        };
        return this.putNote(id, data);
    }

    async putNoteBody(id, body) {
        const data = {
            body,
        };
        return this.putNote(id, data);
    }

    async putNoteTitleBody(id, title, body) {
        const data = {
            title,
            body,
        };
        return this.putNote(id, data);
    }

    async putNoteParentId(id, parentId) {
        const data = {
            parent_id: parentId,
        };
        return this.putNote(id, data);
    }

    async putNote(id, data) {
        const url = `${this.apiUrl}/notes/${id}?token=${this.apiToken}`;
        const response = await this.fetchData(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        return response.json();
    }

    async getTags() {
        const url = `${this.apiUrl}/tags/?token=${this.apiToken}`;
        const response = await this.fetchData(url, {
            method: "GET",
        });
        if (!response.ok) {
            return [];
        }
        const json = await response.json();
        return json.items;
    }

    async getTagId(input) {
        const tag = input.trim().toLowerCase();
        const tags = await this.getTags();
        const item = tags.find((value) => value.title === tag);
        return item?.id;
    }

    async getOrCreateTag(input) {
        const tag = input.trim().toLowerCase();
        const tags = await this.getTags();
        const item = tags.find((value) => value.title.toLowerCase() === tag);
        if (item !== undefined) {
            return item.id;
        }

        const url = `${this.apiUrl}/tags?token=${this.apiToken}`;
        const data = {
            title: tag.trim(),
        };

        const response = await this.fetchData(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const json = await response.json();
        return json.id;
    }

    async setNoteTagId(noteId, tagId) {
        const url = `${this.apiUrl}/tags/${tagId}/notes?token=${this.apiToken}`;
        const data = {
            id: noteId,
        };
        await this.fetchData(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        /* Bug:
            1) Create the note by MemoInjo
            2) Delete the note in Joplin
            3) Create the note by MemoInjo again.

            The response.text() will become "" and
            response.json() will throw exception.

            If a tag is already set, the behaviour will be the same.

            Ignore the result to get rid of this problem
         */
    }

    async getNotebooks() {
        const url = `${this.apiUrl}/folders?token=${this.apiToken}`;
        const response = await this.fetchData(url, {
            method: "GET",
        });
        if (!response.ok) {
            return [];
        }
        const json = await response.json();
        const { items: notebooks } = json;
        const createTree = (parentId) => {
            const items = notebooks.filter(
                (item) => item.parent_id === parentId,
            ).map((item) => {
                const subNotebooks = createTree(item.id);
                return {
                    id: item.id,
                    title: item.title,
                    subNotebooks,
                };
            }).sort((a, b) => (a.title < b.title ? -1 : 1));
            return items;
        };

        const tree = createTree("");
        const sortedNotebooks = [];
        const travel = (list, level = 0) => {
            list.forEach((item) => {
                sortedNotebooks.push({
                    id: item.id,
                    title: item.title,
                    level,
                });
                travel(item.subNotebooks, level + 1);
            });
        };
        travel(tree);

        const storedNotebookId = await this.storageService.get(StorageService.SelectedNotebookId);
        const selectedNotebookId = hasValue(storedNotebookId) ? storedNotebookId : [...sortedNotebooks].shift()?.id ?? "";

        return {
            notebooks: sortedNotebooks,
            selectedNotebookId,
        };
    }

    async urlToId(url) {
        return (await sha256(url)).slice(0, 32);
    }

    async searchNotes(keyword) {
        let hasMore = true;
        let page = 1;
        let items = [];
        while (hasMore) {
            // eslint-disable-next-line
            const url = `${this.apiUrl}/search?token=${this.apiToken}&query=${encodeURIComponent(keyword)}&page=${page}`;

            const response = await this.fetchData(url, {
                method: "GET",
            });
            if (!response.ok) {
                break;
            }
            const json = await response.json();

            items = items.concat(json.items);
            if (json.has_more) { page += 1; } else { hasMore = false; }
        }
        return items;
    }
}
