import DownloadButton from "../../components/ugly-ui/DownloadButton.svelte";
import { DownloadType } from "../../constants";
import type DownloadData from "../../types/DownloadData";
import type UIHandler from "../../types/UIHandler";
import { DownloadDataImage } from "../download-data/DownloadDataImage";
import { DownloadDataVideo } from "../download-data/DownloadDataVideo";
import { getDownloadsFromPackagedMediaJSON, urlFromPermalink } from "../utils";

export default class UglyUIHandler implements UIHandler {
    detectPosts() {
        if (window.location.href.includes('/comments/'))
            return [document.querySelector('[data-test-id="post-content"]')!.parentNode as HTMLElement];

        const feedPostContainer = document.querySelector('.rpBJOHq2PR60pnwJlUyP0');
        if (!feedPostContainer)
            return [];

        const posts = [...feedPostContainer.querySelectorAll('.scrollerItem[data-testid="post-container"]')]
            .filter(element => element.id.length < 16) // Only select an element if its id is not stupidly long as it is in promoted posts
            .filter(element => element.querySelector('div._2mHuuvyV9doV3zwbZPtIPG')) // If this element is not present, the post is not initialized
        return posts as HTMLElement[];
    }

    injectDownloadButton(post: Element, downloads: DownloadData[], onClickMain: (e: MouseEvent) => void, onClickMore: (e: MouseEvent) => void) {
        const buttonContainer = post.querySelector("._3-miAEojrCvx_4FQ8x3P-s")!;
        new DownloadButton({
            target: buttonContainer,
            props: {
                text: 'Download',
                downloads: downloads,
                onClickMain: onClickMain,
                onClickMore: onClickMore
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

    async getDownloads(post: HTMLElement, downloadType?: DownloadType) {
        const res: DownloadData[] = []

        if (downloadType === DownloadType.Video) {
            const player = post.querySelector('shreddit-player')
            if (!player)
                return res;

            const packedMediaJSON = player.getAttribute('packaged-media-json');
            if (!packedMediaJSON)
                return res;

            res.push(...await getDownloadsFromPackagedMediaJSON(packedMediaJSON));
        }

        if(downloadType === DownloadType.Image) {
            const img = post.querySelector('img[alt="Post image"]') as HTMLImageElement;           

            const matches = img.src.match(/^https:\/\/(preview)(\.redd\.it\/.*)\?/);

            if(matches && matches.length > 1 && matches[1] === 'preview') {

                const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image();
                    img.addEventListener('load', () => resolve(img));
                    img.addEventListener('error', (err) => reject(err));
                    img.src = url;
                  });

                const url = `https://i${matches[2]}`;
                const image = await loadImage(url);
                const width = image.naturalWidth;
                const height = image.naturalHeight;

                res.push(new DownloadDataImage(url, width, height))
            } else {
                res.push(new DownloadDataImage(img.src, img.naturalWidth, img.naturalHeight))
            }
        }



        return res;
    }

    getPrimaryDownloadType(post: HTMLElement) {
        if (post.querySelector('div[data-testid="shreddit-player-wrapper"], media-telemetry-observer')) {
            console.log(post)
            return DownloadType.Video;
        }
        if (post.querySelector('ul._1apobczT0TzIKMWpza0OhL'))
            return DownloadType.Gallery;
        if (post.querySelector('img[alt="Post image"]'))
            return DownloadType.Image;
        return null;
    }
}