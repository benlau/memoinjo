import React from "react";
import ReactDOM from "react-dom/client";
import Popup from "./components/popup";
import "./styles/tailwind.css";
const root = ReactDOM.createRoot(
    document.getElementById("editor-view") as HTMLElement,
);
root.render(<Popup />);
