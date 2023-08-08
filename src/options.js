import { DEFAULT_OPTIONS } from "./helpers/constants";
import { loadOptions } from "./helpers/utils";

const optionsFrom = document.querySelector('#options-form');

const enableLoggingCB = document.querySelector('#enable-logging-cb');
const useCustomServerCB = document.querySelector('#use-custom-server-cb');
const customServerAddressTx = document.querySelector('#custom-server-address-tx');
const downloadPathTx = document.querySelector('#download-path-tx');

const resetDefaultBtn = document.querySelector('#reset-default-btn');

// Read options from DOM and save in browser's storage
async function saveOptionsFromDom() {
    const options = {
        downloadPath: downloadPathTx.value,
        enableLogging: enableLoggingCB.checked,
        useCustomServer: useCustomServerCB.checked,
        customServerAddress: customServerAddressTx.value
    };
    await browser.storage.sync.set({ options: options });
    return;
}

function loadOptionsToDom(options) {
    downloadPathTx.value = options.downloadPath;
    enableLoggingCB.checked = options.enableLogging;
    useCustomServerCB.checked = options.useCustomServer;
    customServerAddressTx.value = options.customServerAddress;
    updateCustomServerAddressDisplay();
}

function updateCustomServerAddressDisplay() {
    customServerAddressTx.parentElement.style.display = useCustomServerCB.checked ? 'inherit' : 'none';
}

useCustomServerCB.addEventListener('change', updateCustomServerAddressDisplay)

optionsFrom.addEventListener('submit', e => {
    e.preventDefault();
    saveOptionsFromDom();
})

resetDefaultBtn.addEventListener('click', _ => {
    loadOptionsToDom(DEFAULT_OPTIONS);
})

async function init() {
    const options = await loadOptions()
    loadOptionsToDom(options);
}

init();
