import { DEFAULT_OPTIONS } from "./helpers/constants";

const optionsFrom = document.querySelector('#options-form');

const enableLoggingCB = document.querySelector('#enable-logging-cb');
const useCustomServerCB = document.querySelector('#use-custom-server-cb');
const customServerAddressTx = document.querySelector('#custom-server-address-tx');
const downloadPathTx = document.querySelector('#download-path-tx');

const resetDefaultBtn = document.querySelector('#reset-default-btn');

function setDefaultsIfUndefined(options) {
    let modified = false;
    for (const k in DEFAULT_OPTIONS) {
        if (!options.hasOwnProperty(k)) {
            options[k] = DEFAULT_OPTIONS[k]
            modified = true;
        }
    }
    return modified;
}

async function loadOptions() {
    return new Promise((resolve, reject) => {
        browser.storage.sync.get('options').then(async res => {
            const options = res.options ?? {};
            const modified = setDefaultsIfUndefined(options);
            if (modified) {
                await browser.storage.sync.set({ options: options })
            }
            resolve(options)
        });
    });
}

loadOptions()
    .then(options => {
        loadOptionsToDom(options);
        updateCustomServerAddressVisibility();
    });

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
    updateCustomServerAddressVisibility();
}

function updateCustomServerAddressVisibility() {
    customServerAddressTx.parentElement.style.display = useCustomServerCB.checked ? 'inherit' : 'none';
}

useCustomServerCB.addEventListener('change', updateCustomServerAddressVisibility)

optionsFrom.addEventListener('submit', e => {
    e.preventDefault();
    saveOptionsFromDom();
})

resetDefaultBtn.addEventListener('click', _ => {
    loadOptionsToDom(DEFAULT_OPTIONS);
})