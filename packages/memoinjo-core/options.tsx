import React from "react";
import ReactDOM from "react-dom/client";
import Options from "./components/options";
import "./lib/bower_components/bootstrap.min.css";
import "../../src/styles/tailwind.css";
const root = ReactDOM.createRoot(
    document.getElementById("options-view") as HTMLElement,
);
root.render(<Options />);
