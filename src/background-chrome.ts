import Browser from "webextension-polyfill";

Browser.runtime.onMessage.addListener(handleMessage);
async function handleMessage(message: any, sender: any, sendResponse: () => void) {
    if(message.action === 'download') {       
        Browser.downloads.download({
            url: message.url
        });
    }

    if(message.action === 'reload') {
        const currentTab = (await Browser.tabs.query({active: true, currentWindow: true}))[0];
        Browser.tabs.reload(currentTab.id);
        
        // Without setTimeout, the page doesn't reload no matter the execution order for whatever reason ¯\_(ツ)_/¯
        setTimeout(() => {
            Browser.runtime.reload();
        });
    }
}