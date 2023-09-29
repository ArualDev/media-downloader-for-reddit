import NewUIHandler from "./NewUIHandler";
import OldUIHandler from "./OldUIHandler";
import type UIHandler from "./UIHandler";
import UglyUIHandler from "./UglyUIHandler";

export function getUIHandler(): UIHandler {
    if (document.body.classList.contains('v2'))
        return new NewUIHandler();
    if (!document.documentElement.classList.contains('theme-beta'))
        return new OldUIHandler();
    return new UglyUIHandler();
}