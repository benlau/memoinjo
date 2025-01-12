import React from "react";
import { PopupProvider } from "../contexts/popupcontext";
import { PopupView } from "../views/popupview";

const Popup: React.FC = () => {
    return (
        <PopupProvider>
            <PopupView />
        </PopupProvider>
    );
};

export default Popup;
