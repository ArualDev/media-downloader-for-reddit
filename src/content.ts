/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { JSX, render } from 'preact';

import Browser from 'webextension-polyfill';
import DownloadButtonOldUI from './components/old-ui/DownloadButton.tsx';
import DownloadButtonUglyUI from './components/ugly-ui/DownloadButton.tsx';
import DownloadButtonNewUI from './components/new-ui/DownloadButton.tsx';
import { UIVersion } from "./constants.ts";

interface UIHandler {
    detectPosts: () => HTMLElement[];
    downloadButtonComponent: (props: { btnText: string, onClick: JSX.MouseEventHandler<HTMLElement> }) => JSX.Element;
    injectDownloadButton: (post: Element, onClick: JSX.MouseEventHandler<HTMLElement>) => void;
    upvote: (post: HTMLElement) => void;
}

class NewUIHandler implements UIHandler {
    detectPosts() {
        const posts = document.querySelectorAll('shreddit-post');
        return [...posts] as HTMLElement[];
    }

    // getUpvoteButton(post: Element) {
    //     return post.shadowRoot?.querySelector('button[upvote]') as HTMLElement ?? null;
    // }

    downloadButtonComponent = DownloadButtonNewUI;
    injectDownloadButton(post: Element, onClick: JSX.MouseEventHandler<HTMLElement>) {
        const buttonContainer = post.shadowRoot?.querySelector('shreddit-post-share-button')?.parentElement;
        const wrapper = document.createElement('div');
        buttonContainer?.append(wrapper);
        // const root = createRoot(wrapper)
        // root.render(DownloadButtonNewUI({
        //     btnText: 'Download', onClick: onClick
        // }))

        render(DownloadButtonNewUI({btnText: 'Download', onClick}), wrapper);
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

    // getUpvoteButton(post: Element) {
    //     return  as HTMLElement
    // }
    downloadButtonComponent = DownloadButtonNewUI;
    injectDownloadButton(post: Element, onClick: JSX.MouseEventHandler<HTMLElement>) {
        // const buttonContainer = post.querySelector('.flat-list.buttons');
        // const wrapper = document.createElement('li');
        // buttonContainer?.append(wrapper);
        // const root = createRoot(wrapper)
        // root.render(new DownloadButtonOldUI({
        //     btnText: 'download', onClick: onClick
        // }))

        // root.render(<DownloadButtonOldUI/>)
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
            return element.id.length < 16; // Only select an element if its id is not stupidly long as in ads
        });
        return posts as HTMLElement[];
    }

    getUpvoteButton(post: Element) {
        return post.querySelector('div div button:first-child[aria-pressed="false"]') as HTMLElement
    }
    downloadButtonComponent = DownloadButtonNewUI;
    injectDownloadButton(post: Element, onClick: JSX.MouseEventHandler<HTMLElement>) {
        // const buttonContainer = post.querySelector("._3-miAEojrCvx_4FQ8x3P-s");
        // const permalink = post.querySelector("a[data-click-id=body]")?.getAttribute("href")
        // if (!permalink)
        //     return;

        // const wrapper = document.createElement('div');
        // buttonContainer?.append(wrapper);
        // const root = createRoot(wrapper)
        // root.render(DownloadButtonUglyUI({
        //     btnText: 'Download', onClick: onClick
        // }))
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

        uiHandler.injectDownloadButton(post, e => {
            e.preventDefault();
            console.log('download');
            Browser.runtime.sendMessage({
                action: 'download',
                url: 'https://preview.redd.it/nqbegxjcgtob1.jpg?width=640&crop=smart&auto=webp&s=c3e2bc51e0d42b38a40f6476ade3ed68c2c4fcfc',
            });
        });
    }
}

setInterval(() => {
    detectPosts();
}, 400)
detectPosts();

