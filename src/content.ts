import Browser from 'webextension-polyfill';
import injectDevReload from './dev/injectDevReload';
import PostData from './lib/PostData';
import DownloadScreen from './components/common/DownloadScreen.svelte';
import { getUIHandler } from './lib/ui-handling/getUIHandler';

let uiHandler = getUIHandler();

const downloadScreenWrapper = document.createElement('div');
const downloadScreenWrapperShadow = downloadScreenWrapper.attachShadow({ mode: 'open' })
document.body.appendChild(downloadScreenWrapper);
const downloadScreen = new DownloadScreen({
    target: downloadScreenWrapperShadow
});

async function handlePost(postElement: HTMLElement) {
    const postData = new PostData(postElement, uiHandler);

    if (postData.primaryDownloadType === null)
        return;

    let loadedDownloads = false;

    async function handleClickMain() {

        if (!loadedDownloads) {
            await postData.getDownloadsFromUI()
            loadedDownloads = true;
        }

        if (postData.downloads.length === 0)
            return;
        postData.downloads[0].download();
    }

    async function handleClickMore() {
        if (!loadedDownloads) {
            await postData.getDownloadsFromUI()
            loadedDownloads = true;
        }
        downloadScreen.updateDownloads(postData.downloads)
        downloadScreen.toggle();

        for (const download of postData.downloads) {
            if (download.fileSize)
                continue;
            download.fetchFileSize()
                .then(() => {
                    downloadScreen.updateDownloads(postData.downloads);
                });
        }
    }

    uiHandler.injectDownloadButton(postElement, postData.downloads, handleClickMain, handleClickMore);
    postElement.setAttribute('mdfr-injected', '');
}

async function detectPosts() {
    const posts = uiHandler.detectPosts();

    for (const post of posts) {
        if (post.hasAttribute('mdfr-injected'))
            continue;
        handlePost(post);
    }
}

setInterval(() => {
    detectPosts();
}, 400)
detectPosts();

injectDevReload();