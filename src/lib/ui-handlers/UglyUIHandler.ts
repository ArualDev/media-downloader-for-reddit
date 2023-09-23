import DownloadButton from "../../components/ugly-ui/DownloadButton.svelte";
import { DownloadType } from "../../constants";
import type DownloadData from "../../types/DownloadData";
import type UIHandler from "../../types/UIHandler";
import { urlFromPermalink } from "../utils";

class TestDownloadData implements DownloadData {
    url: string;
    constructor(url: string) {
        this.url = url;
    }
}

export default class UglyUIHandler implements UIHandler {
    detectPosts() {
        const feedPostContainer = document.querySelector('.rpBJOHq2PR60pnwJlUyP0')
            ?? document.querySelector('[data-scroller-first=""]')?.parentNode;
        if (!feedPostContainer)
            return [];

        const posts = [...feedPostContainer.querySelectorAll('.scrollerItem[data-testid="post-container"]')]
            .filter(element => element.id.length < 16) // Only select an element if its id is not stupidly long as it is in promoted posts
            .filter(element => element.querySelector('div._2mHuuvyV9doV3zwbZPtIPG')) // If this element is not present, the post is not initialized
        return posts as HTMLElement[];
    }

    injectDownloadButton(post: Element, downloads: DownloadData[], onClick: (e: MouseEvent) => void) {
        const buttonContainer = post.querySelector("._3-miAEojrCvx_4FQ8x3P-s")!;
        new DownloadButton({
            target: buttonContainer,
            props: {
                text: 'Download',
                downloads: downloads,
                onClick: onClick
            }
        })
    }

    upvote(post: HTMLElement) {
        const button = post.querySelector('div div button:first-child[aria-pressed="false"]') as HTMLElement | null
        button?.click();
    }

    getPostURL(post: HTMLElement) {
        const permalink = post.querySelector("a[data-click-id=body]")?.getAttribute("href")!;
        return urlFromPermalink(permalink);
    }

    async getDownloads(post: HTMLElement) {
        const res: DownloadData[] = []

        const player = post.querySelector('shreddit-player')

        if (!player)
            return res;

        const packagedJsonInfo = player.getAttribute('packaged-media-json');
        if (!packagedJsonInfo)
            return res;

        res.push(new TestDownloadData(packagedJsonInfo));

        return res;
    }

    getPrimaryDownloadType(post: HTMLElement) {
        const a = post.querySelector('shreddit-player')
        console.log(a);

        if (a)
            console.log(post, a.getAttribute('packaged-media-json'));

        if (post.querySelector('div[data-testid="shreddit-player-wrapper"], media-telemetry-observer'))
            return DownloadType.Video;
        if (post.querySelector('ul._1apobczT0TzIKMWpza0OhL'))
            return DownloadType.Gallery;
        if (post.querySelector('img[alt="Post image"]'))
            return DownloadType.Image;
        return null;
    }
}