import Browser from "webextension-polyfill";
import ReloadButton from "./ReloadButton.svelte";

export default function injectDevReload() {
    function reload() {
        Browser.runtime.sendMessage({
            action: 'reload'
        });
    }

    function addButton() {
        const wrapper = document.createElement('div');
        const shadow = wrapper.attachShadow({ mode: 'open' });
        document.body.appendChild(wrapper);
        new ReloadButton({
            target: shadow,
            props: {
                onClick: () => {
                    reload();
                }
            }
        })
    }

    function overrideF5() {
        document.body.onkeydown = e => {
            if (e.key !== 'F5')
                return;
            e.preventDefault();
            reload();
        }
    }

    addButton();
    overrideF5();
}

