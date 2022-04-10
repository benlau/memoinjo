/*!
 * jQuery Textarea AutoSize plugin
 * Author: Javier Julio
 * Licensed under the MIT license
 */
(function ($, window, document, undefined) {
    const pluginName = "textareaAutoSize";
    const pluginDataName = `plugin_${pluginName}`;

    const containsText = function (value) {
        return (value.replace(/\s/g, "").length > 0);
    };

    function Plugin(element, options) {
        this.element = element;
        this.$element = $(element);
        this.init();
    }

    Plugin.prototype = {
        init() {
            const height = this.$element.outerHeight();
            const diff = parseInt(this.$element.css("paddingBottom"))
                 + parseInt(this.$element.css("paddingTop")) || 0;

            if (containsText(this.element.value)) {
                this.$element.height(this.element.scrollHeight - diff);
            }

            // keyup is required for IE to properly reset height when deleting text
            this.$element.on("input keyup", function (event) {
                const $window = $(window);
                const currentScrollPosition = $window.scrollTop();

                $(this)
                    .height(0)
                    .height(this.scrollHeight - diff);

                $window.scrollTop(currentScrollPosition);
            });
        },
    };

    $.fn[pluginName] = function (options) {
        this.each(function () {
            if (!$.data(this, pluginDataName)) {
                $.data(this, pluginDataName, new Plugin(this, options));
            }
        });
        return this;
    };
}(jQuery, window, document));
