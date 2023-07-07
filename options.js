const enableLoggingCB = document.querySelector('#enable-logging-cb');

async function saveOptions(enableLogging = false) {
    const options = {
        enableLogging: enableLogging
    };
    browser.storage.sync.set({options: options});
}

browser.storage.sync.get('options').then(async res => {
    let options = res;
    if(!res)
        options = await saveOptions();
    loadOptions(options);
});

function loadOptions(options) {
    enableLoggingCB.checked = options.options.enableLogging;
}

enableLoggingCB.addEventListener('change', e => {
    saveOptions(enableLoggingCB.checked)
});