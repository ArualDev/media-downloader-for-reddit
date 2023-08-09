import log from "./log";
import { DEFAULT_OPTIONS } from "./constants";

export function sendDownloadRequestToBackground(url, filename, saveAs = false) {
    log(`Download request: \nURL:\t${url}\nFile name:\t${filename}`)
    browser.runtime.sendMessage({
        action: 'download',
        url: url,
        filename: filename,
        saveAs: saveAs
    });
}


export async function getVersionFromBackground() {
    return await browser.runtime.sendMessage({
        action: 'getVersion',
    });
}


export function getRandomString(len) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let res = '';
    for (let i = 0; i < len; i++) {
        const index = Math.floor(Math.random() * chars.length);
        res += chars.charAt(index);
    }
    return res;
}


export function permalinkToUrl(permalink) {
    return `https://reddit.com${permalink}`;
}


export function nameFromPermalink(permalink) {
    const segments = permalink.split('/');
    if (segments.length < 6)
        return '';
    return segments[5];
}


export function fileExtFromUrl(url) {
    const pattern = /(\.\w{3,4})($|\?)/;
    const matches = url.match(pattern);
    return matches ? matches[1] : null;
}


export function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
}


export async function fetchFileSize(url) {
    return fetch(url, { method: 'HEAD' })
        .then(response => {
            if (!response.ok)
                return null;
            const fileSize = parseInt(response.headers.get('Content-Length'));
            return fileSize;
        })
}


export function setOptionsDefaultsIfUndefined(options) {
    let modified = false;
    for (const k in DEFAULT_OPTIONS) {
        if (!options.hasOwnProperty(k)) {
            options[k] = DEFAULT_OPTIONS[k]
            modified = true;
        }
    }
    return modified;
}


export async function loadOptions() {
    const savedOptions = await browser.storage.sync.get('options');
    const options = savedOptions.options ?? {};

    const modified = setOptionsDefaultsIfUndefined(options);
    if (modified) {
        await browser.storage.sync.set({ options: options })
    }
    return options;
}