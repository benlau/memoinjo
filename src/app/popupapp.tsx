import React from "react";
import ReactDOM from "react-dom/client";
import Popup from "../components/popup";
import "../styles/tailwind.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

const root = ReactDOM.createRoot(
    document.getElementById("editor-view") as HTMLElement,
);
root.render(
    <Theme>
        <Popup />
    </Theme>,
);
