const enableLoggingCB = document.querySelector('#enable-logging-cb');
const useCustomServerCB = document.querySelector('#use-custom-server-cb');
const customServerAddressTx = document.querySelector('#custom-server-address-tx');
const optionsFrom = document.querySelector('#options-form');

const resetDefaultBtn = document.querySelector('#reset-default-btn');

const defaultOptions = {
    enableLogging: false,
    useCustomServer: false,
    customServerAddress: 'http://localhost:21370'
}

function setDefaultsIfUndefined(options) {
    let modified = false;
    for (const k in defaultOptions) {
        if (!options.hasOwnProperty(k)) {
            options[k] = defaultOptions[k]
            modified = true;
        }
    }
    return modified;
}

browser.storage.sync.get('options').then(async res => {
    const options = res.options ?? {};
    const modified = setDefaultsIfUndefined(options);
    if (modified) {
        await browser.storage.sync.set({ options: options })
    }
    loadOptionsToDom(options);
    updateCustomServerAddressVisibility();
});

async function saveOptionsFromDom() {
    const options = {
        enableLogging: enableLoggingCB.checked,
        useCustomServer: useCustomServerCB.checked,
        customServerAddress: customServerAddressTx.value
    };
    await browser.storage.sync.set({options: options});
    return;
}

function loadOptionsToDom(options) {
    enableLoggingCB.checked = options.enableLogging;
    useCustomServerCB.checked = options.useCustomServer;
    customServerAddressTx.value = options.customServerAddress;
    updateCustomServerAddressVisibility();
}

function updateCustomServerAddressVisibility() {
    customServerAddressTx.parentElement.style.display = useCustomServerCB.checked ? 'inherit': 'none';
}

useCustomServerCB.addEventListener('change', updateCustomServerAddressVisibility)

optionsFrom.addEventListener('submit', e => {
    e.preventDefault();
    saveOptionsFromDom();
})

resetDefaultBtn.addEventListener('click', _ => {
    loadOptionsToDom(defaultOptions);
})