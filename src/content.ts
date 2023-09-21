import Browser from 'webextension-polyfill';
import { UIVersion } from "./constants";
import injectDevReload from './dev/injectDevReload';
import DownloadButtonNewUI from './components/new-ui/DownloadButton.svelte';
import DownloadButtonUglyUI from './components/ugly-ui/DownloadButton.svelte';
import DownloadButtonOldUI from './components/old-ui/DownloadButton.svelte';

interface UIHandler {
    detectPosts: () => HTMLElement[];
    injectDownloadButton: (post: Element, onClick: (e: MouseEvent) => void) => void;
    upvote: (post: HTMLElement) => void;
}

class NewUIHandler implements UIHandler {
    detectPosts() {
        const posts = document.querySelectorAll('shreddit-post');
        return [...posts] as HTMLElement[];
    }

    injectDownloadButton(post: Element, onClick: (e: MouseEvent) => void) {
        const buttonContainer = post.shadowRoot?.querySelector('shreddit-post-share-button')?.parentElement!;
        new DownloadButtonNewUI({
            target: buttonContainer,
            props: {
                text: 'Download',
                onClick: onClick
            }
        });
    }

    upvote(post: HTMLElement) {
        const button = post.shadowRoot?.querySelector('button[upvote]') as HTMLElement | null;
        button?.click();
    }
}

class OldUIHandler implements UIHandler {
    detectPosts() {
        const posts = document.querySelectorAll('#siteTable.linklisting div.link');
        return [...posts] as HTMLElement[];
    }

    injectDownloadButton(post: Element, onClick: (e: MouseEvent) => void) {
        const buttonContainer = post.querySelector('.flat-list.buttons')!;
        new DownloadButtonOldUI({
            target: buttonContainer,
            props: {
                text: 'download',
                onClick: onClick
            }
        })
    }

    upvote(post: HTMLElement) {
        const button = post.querySelector('.arrow.up') as HTMLElement | null;
        button?.click();
    }
}


class UglyUIHandler implements UIHandler {
    detectPosts() {
        const feedPostContainer = document.querySelector('.rpBJOHq2PR60pnwJlUyP0')
            ?? document.querySelector('[data-scroller-first=""]')?.parentNode;
        if (!feedPostContainer)
            return [];

        const posts = [...feedPostContainer.querySelectorAll('.scrollerItem[data-testid="post-container"]')].filter(element => {
            return element.id.length < 16; // Only select an element if its id is not stupidly long as it is in promoted posts
        });
        return posts as HTMLElement[];
    }

    getUpvoteButton(post: Element) {
        return post.querySelector('div div button:first-child[aria-pressed="false"]') as HTMLElement
    }
    injectDownloadButton(post: Element, onClick: (e: MouseEvent) => void) {
        const buttonContainer = post.querySelector("._3-miAEojrCvx_4FQ8x3P-s")!;
        new DownloadButtonUglyUI({
            target: buttonContainer,
            props: {
                text: 'Download',
                onClick: onClick
            }
        })
    }

    upvote(post: HTMLElement) {
        const button = post.querySelector('div div button:first-child[aria-pressed="false"]') as HTMLElement | null
        button?.click();
    }
}


let url = 'https://www.reddit.com/r/PhotoshopRequest/comments/16fc02m/not_able_to_tip_but_could_someone_help_me_pull_a/';
url += '.json?raw_json=1';

function getUIVersion(): UIVersion {
    if (document.body.classList.contains('v2'))
        return UIVersion.NewUI;

    if (!document.documentElement.classList.contains('theme-beta'))
        return UIVersion.OldUI

    return UIVersion.UglyUI;
}

function getUIHandler(uiVersion: UIVersion) {
    if(uiVersion === UIVersion.OldUI)
        return new OldUIHandler();
    if(uiVersion === UIVersion.UglyUI)
        return new UglyUIHandler();
    if(uiVersion === UIVersion.NewUI)
        return new NewUIHandler();
    throw new Error('Handler not implemented!');
}

let currentUIVersion = getUIVersion();
let uiHandler = getUIHandler(currentUIVersion);

async function detectPosts() {
    const uiVersion = getUIVersion();
    if(uiVersion != currentUIVersion) {
        uiHandler = getUIHandler(uiVersion);
        currentUIVersion = uiVersion;
    }

    const posts = uiHandler.detectPosts();

    for (const post of posts) {
        if (post.hasAttribute('checked'))
            continue;
        post.setAttribute('checked', '');

        function handleClick(e: MouseEvent) {
            e.preventDefault();
            console.log('download');
            Browser.runtime.sendMessage({
                action: 'download',
                url: 'https://preview.redd.it/nqbegxjcgtob1.jpg?width=640&crop=smart&auto=webp&s=c3e2bc51e0d42b38a40f6476ade3ed68c2c4fcfc',
            });
        }

        uiHandler.injectDownloadButton(post, handleClick);
    }
}

setInterval(() => {
    detectPosts();
}, 400)
detectPosts();

injectDevReload();