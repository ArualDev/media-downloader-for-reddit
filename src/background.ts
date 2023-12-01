import Browser from "webextension-polyfill";

Browser.runtime.onMessage.addListener(handleMessage);
async function handleMessage(message: any, sender: any, sendResponse: any) {
    if (message.action === 'download') {
        Browser.downloads.download({
            url: message.url
        });
    }

    if (message.action === 'reload') {
        const currentTab = (await Browser.tabs.query({ active: true, currentWindow: true }))[0];
        Browser.tabs.reload(currentTab.id);

        // Without setTimeout, the page doesn't reload no matter the execution order for whatever reason ¯\_(ツ)_/¯
        setTimeout(() => {
            Browser.runtime.reload();
        });
    }

    if (message.action === 'fetch-file-size') {
        const response = await fetch(message.url, { method: 'HEAD' })
        if (!response.ok)
            return null;
        const contentLengthStr = response.headers.get('Content-Length')
        if (!contentLengthStr)
            return null;
        const fileSize = parseInt(contentLengthStr);
        return fileSize;
    }

    if (message.action === 'fetch-json') {
        const response = await fetch(message.url)
        if (!response.ok)
            return null;
        try {
            return response.json();
        } catch (error) {
            console.error(error);
            return null;
        }

    }

    return true;
}