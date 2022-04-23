const MAX_NOTES = 50;

export default class SearchingView {
    constructor(popupService, onBackClicked) {
        this.popupService = popupService;
        this.onBackClicked = onBackClicked;
    }

    mount(parent) {
        const html = `
        <div>
            <div>
                <a id="searching-view-back-link" href="#" class="icon-button"><i class="mdi mdi-arrow-left"></i></a>
                <span class="ml-1">Related Memos</span>
            </div>
            <div id="searching-view-content" class="mt-2">
            </div>
        </div>
        `;

        $(parent).html(html);
        $("#searching-view-back-link").on("click", this.onBackClicked);

        this.refresh();
    }

    refresh() {
        $("#searching-view-content").html("");
        this.popupService.searchRelatedNotes(this.popupService.currentTab.url, MAX_NOTES, (notes) => {
            notes.forEach((note) => {
                const joplinLink = `joplin://x-callback-url/openNote?id=${note.id}`;

                const link = document.createElement("a");
                $(link).attr("href", joplinLink);
                $(link).text(note.title);

                const elem = document.createElement("div");
                $(elem).addClass("searching-view-item");
                $(elem).append(link);
                $("#searching-view-content").append(elem);
            });
        });
    }
}
