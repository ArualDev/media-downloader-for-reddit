import Browser from 'webextension-polyfill';
import injectDevReload from './dev/injectDevReload';
import OldUIHandler from './lib/ui-handlers/OldUIHandler';
import UglyUIHandler from './lib/ui-handlers/UglyUIHandler';
import NewUIHandler from './lib/ui-handlers/NewUIHandler';
import type UIHandler from './types/UIHandler';
import PostData from './lib/PostData';

function getUIHandler(): UIHandler {
    if (document.body.classList.contains('v2'))
        return new NewUIHandler();
    if (!document.documentElement.classList.contains('theme-beta'))
        return new OldUIHandler();
    return new UglyUIHandler();
}

let uiHandler = getUIHandler();

async function handlePost(postElement: HTMLElement) {
    const postData = new PostData(postElement, uiHandler);
    
    if(postData.primaryDownloadType === null)
        return;

    await postData.getDownloadsFromUI();

    uiHandler.injectDownloadButton(postElement, postData.downloads, e => {

        if(postData.downloads.length === 0)
            return; 

        Browser.runtime.sendMessage({
            action: 'download',
            url: postData.downloads[0].url
        });
    });
    
    // console.log(postData.primaryDownloadType, postData.postURL);
    
    console.log(postData.primaryDownloadType, postElement, postData.downloads);


}
const observer = new MutationObserver((mutation) => {
            console.log(mutation);
            
        })
async function detectPosts() {
    const posts = uiHandler.detectPosts();    

    for (const post of posts) {

        if (post.hasAttribute('checked'))
            continue;
        post.setAttribute('checked', '');
          
        // observer.observe(post, {childList: true, attributes: true, subtree: true});
        handlePost(post);

    }
}

setInterval(() => {
    detectPosts();
}, 400)
detectPosts();

injectDevReload();