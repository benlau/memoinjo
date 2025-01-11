import React from "react";

/* Rewritten from jQuery Textarea AutoSize plugin
 * The original Author: Javier Julio
 * Licensed under the MIT license
 */

const containsText = (value: string): boolean => {
    return value.replace(/\s/g, "").length > 0;
};

export const useAutosize = () => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const adjustHeight = () => {
            const diff =
                parseInt(window.getComputedStyle(textarea).paddingBottom) +
                    parseInt(window.getComputedStyle(textarea).paddingTop) || 0;

            if (containsText(textarea.value)) {
                textarea.style.height = "0";
                textarea.style.height = `${textarea.scrollHeight - diff}px`;
            }
        };

        adjustHeight();

        const handleResize = () => {
            const currentScrollPosition = window.scrollY;
            adjustHeight();
            window.scrollTo(0, currentScrollPosition);
        };

        textarea.addEventListener("input", handleResize);
        textarea.addEventListener("keyup", handleResize);

        return () => {
            textarea.removeEventListener("input", handleResize);
            textarea.removeEventListener("keyup", handleResize);
        };
    }, []);

    return textareaRef;
};
