export default class BrowserService {
    isChrome() {
        return !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    }

    isFirefox() {
        return typeof InstallTrigger !== "undefined";
    }

    async queryTabs(options) {
        if (this.isFirefox()) {
            return browser.tabs.query(options);
        }
        return chrome.tabs.query(options);
    }
}
