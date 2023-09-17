import Browser from "webextension-polyfill";


Browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message: any, sender: any, sendResponse: () => void): true | void | Promise<any> {
    
    if(message.action === 'download') {
        Browser.downloads.download({
            url: message.url
        });
    }
}
