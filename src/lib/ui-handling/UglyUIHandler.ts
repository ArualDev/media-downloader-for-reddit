import Browser from "webextension-polyfill";
import DownloadButton from "../../components/ugly-ui/DownloadButton.svelte";
import { DownloadType } from "../../constants";
import type UIHandler from "./UIHandler";
import { fetchImageDimensionsFromURL, getDownloadsFromPackagedMediaJSON, postUrlFromPermalink } from "../utils";
import type { BaseDownloadable } from "../download-data/BaseDownloadable";
import { ImageDownloadable } from "../download-data/ImageDownloadable";
import { GalleryDownloadable } from "../download-data/GalleryDownloadable";

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

    injectDownloadButton(post: Element, downloads: BaseDownloadData[], onClickMain: (e: MouseEvent) => void, onClickMore: (e: MouseEvent) => void) {
        const buttonContainer = post.querySelector("._3-miAEojrCvx_4FQ8x3P-s")!;
        new DownloadButton({
            target: buttonContainer,
            props: {
                text: 'Download',
                downloads: downloads,
                onClickMain: onClickMain,
                onClickMore: onClickMore
            }
        });
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
        const res: BaseDownloadable[] = []

        if (downloadType === DownloadType.Video) {
            const player = post.querySelector('shreddit-player')
            if (!player)
                return res;

            const packedMediaJSON = player.getAttribute('packaged-media-json');
            if (!packedMediaJSON)
                return res;

            res.push(...await getDownloadsFromPackagedMediaJSON(packedMediaJSON));
        }

        if (downloadType === DownloadType.Image) {
            const img = post.querySelector('img[alt="Post image"]') as HTMLImageElement;

            const matches = img.src.match(/^https:\/\/(preview)(\.redd\.it\/.*)\?/);

            if (matches && matches.length > 1 && matches[1] === 'preview') {

                const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image();
                    img.addEventListener('load', () => resolve(img));
                    img.addEventListener('error', (err) => reject(err));
                    img.src = url;
                });

                const url = `https://i${matches[2]}`;
                // const image = await loadImage(url);
                // const width = image.naturalWidth;
                // const height = image.naturalHeight;

                res.push(new ImageDownloadable({
                    url: url,
                    dimensions: await fetchImageDimensionsFromURL(url)
                }))
            } else {
                res.push(new ImageDownloadable({
                    url: img.src,
                    dimensions: {
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    }
                }))
            }
        }

        if (downloadType === DownloadType.Gallery) {
            const imgElements = post.querySelectorAll('ul li figure img');
            console.log(imgElements);


            const imageDownloads: ImageDownloadable[] = [];
            for (const imgElement of imgElements) {
                let src = imgElement.getAttribute('src')!;

                // Extract the original image from the .webp path
                const match = src.match(/-.{2}-(.+)\?/);

                // If the original image cannot be extracted, use the provided src path
                src = match ? `https://i.redd.it/${match[1]}` : src;

                imageDownloads.push(new ImageDownloadable({
                    url: src,
                    dimensions: await fetchImageDimensionsFromURL(src)
                }))
            }

            res.push(new GalleryDownloadable({
                imageDownloadables: imageDownloads
            }));
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