import Browser from "webextension-polyfill";
import DownloadButton from "../../components/ugly-ui/DownloadButton.svelte";
import { DownloadType } from "../../constants";
import type UIHandler from "./UIHandler";
import { fetchImageDimensionsFromURL, getDownloadsFromPackagedMediaJSON, getOriginalImageFileNameFromUrl, postUrlFromPermalink } from "../utils";
import type { BaseDownloadable } from "../downloadable/BaseDownloadable";
import { ImageDownloadable } from "../downloadable/ImageDownloadable";
import { GalleryDownloadable } from "../downloadable/GalleryDownloadable";
import type { VideoDownloadable } from "../downloadable/VideoDownloadable";

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

    injectDownloadButton(post: Element, downloads: BaseDownloadable[], onClickMain: (e: MouseEvent) => void, onClickMore: (e: MouseEvent) => void) {
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
        const permalink = this.getPostPermalink(post);
        return postUrlFromPermalink(permalink);
    }

    getPostPermalink(post: HTMLElement): string {
        return post.querySelector("a[data-click-id=body]")?.getAttribute("href")!;
    }

    async getImageDownloadables(post: HTMLElement): Promise<ImageDownloadable[]> {
        const img = post.querySelector('img[alt="Post image"]') as HTMLImageElement;

        const originalFileName = getOriginalImageFileNameFromUrl(img.src);

        if (originalFileName) {
            const url = `https://i.redd.it/${originalFileName}`;
            return [
                new ImageDownloadable({
                    url: url,
                    dimensions: await fetchImageDimensionsFromURL(url)
                })
            ];
        }

        return [
            new ImageDownloadable({
                url: img.src,
                dimensions: {
                    width: img.naturalWidth,
                    height: img.naturalHeight
                }
            })
        ]
    }

    async getVideoDownloadables(post: HTMLElement): Promise<VideoDownloadable[]> {
        const player = post.querySelector('shreddit-player') as HTMLElement | null;
        if (!player)
            return [];

        const packedMediaJSON = player.getAttribute('packaged-media-json');
        if (!packedMediaJSON)
            return [];

        return await getDownloadsFromPackagedMediaJSON(packedMediaJSON);
    }

    async getGalleryDownloadables(post: HTMLElement): Promise<GalleryDownloadable[]> {

        const liElements = [...post.querySelectorAll('ul li')] as HTMLImageElement[];
        const imgElements = [...post.querySelectorAll('ul li figure img')] as HTMLImageElement[];

        // If some images of the gallery are not loaded, discard the gallery. 
        // In this UI version galleries load only two first images by default, so only these images can be guaranteed.
        // There seems to be no other way to scrape the rest of the images without some tricky DOM manipulation or making a request
        // and what's the point in making another request if API returns all the info anyway.
        // TODO: Figure out a way to make reddit front-end load all images first
        if (liElements.length > imgElements.length)
            return []

        const imageDownloads: ImageDownloadable[] = [];
        for (const imgElement of imgElements) {
            let src = imgElement.src;

            // Extract the original image from the .webp path
            const originalFileName = getOriginalImageFileNameFromUrl(src);

            // If the original image cannot be extracted, use the provided src path
            src = originalFileName ? `https://i.redd.it/${originalFileName}` : src;

            imageDownloads.push(new ImageDownloadable({
                url: src,
                dimensions: await fetchImageDimensionsFromURL(src)
            }))
        }

        return [
            new GalleryDownloadable({
                imageDownloadables: imageDownloads
            })
        ];
    }

    getPrimaryDownloadType(post: HTMLElement) {
        if (post.querySelector('div[data-testid="shreddit-player-wrapper"], media-telemetry-observer'))
            return DownloadType.Video;
        if (post.querySelector('ul._1apobczT0TzIKMWpza0OhL'))
            return DownloadType.Gallery;
        if (post.querySelector('img[alt="Post image"]'))
            return DownloadType.Image;
        return null;
    }
}