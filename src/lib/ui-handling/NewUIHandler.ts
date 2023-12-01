import DownloadButton from "../../components/new-ui/DownloadButton.svelte";
import { DownloadType } from "../../constants";
// import type DownloadData from "../download-data/DownloadData";
import type UIHandler from "./UIHandler";
import { fetchImageDimensionsFromURL, getDownloadsFromPackagedMediaJSON, urlFromPermalink } from "../utils";
import type { BaseDownloadData } from "../download-data/BaseDownloadData";
import { ImageDownloadData } from "../download-data/ImageDownloadData ";
import { GalleryDownloadData } from "../download-data/GalleryDownloadData";

export default class NewUIHandler implements UIHandler {

    detectPosts() {
        const posts = document.querySelectorAll('shreddit-post');
        return [...posts] as HTMLElement[];
    }

    injectDownloadButton(post: Element, downloads: BaseDownloadData[], onClickMain: (e: MouseEvent) => void, onClickMore: (e: MouseEvent) => void) {
        const buttonContainer = post.shadowRoot?.querySelector('shreddit-post-share-button')?.parentElement!;
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
        const button = post.shadowRoot?.querySelector('button[upvote]') as HTMLElement | null;
        button?.click();
    }

    getPostURL(post: HTMLElement) {
        const permalink = post.getAttribute('permalink')!;
        return urlFromPermalink(permalink);
    };

    async getDownloads(post: HTMLElement, downloadType?: DownloadType) {
        const res: BaseDownloadData[] = [];

        if (downloadType === DownloadType.Video) {
            const player = post.querySelector('shreddit-player')
            const packedMediaJSON = player?.getAttribute('packaged-media-json');
            if (!packedMediaJSON)
                return res;
            res.push(...await getDownloadsFromPackagedMediaJSON(packedMediaJSON));
        }

        if (downloadType === DownloadType.Image) {
            const contentHref = post.getAttribute('content-href');

            const srcset = (post.querySelector('img') as HTMLImageElement)?.srcset;
            const match = srcset.match(/\s(\d+)w$/);
            // const aspectRatio = Number((post.querySelector('shreddit-aspect-ratio') as HTMLElement)?.style.getPropertyValue('--aspect-ratio'));
            // const width = match ? parseInt(match[1]) : undefined;
            // const height = width ? Math.ceil(width * aspectRatio) : undefined; // It is off by one pixel in some cases. Dunno why exactly

            if (contentHref) {
                res.push(new ImageDownloadData({
                    url: contentHref,
                    dimensions: await fetchImageDimensionsFromURL(contentHref!)
                }));
            }
        }

        if (downloadType === DownloadType.Gallery) {
            const imgElements = post.querySelectorAll('ul li a figure img');

            const imageDownloads: ImageDownloadData[] = [];
            for (const imgElement of imgElements) {
                let src = imgElement.getAttribute('src')!;

                // Extract the original image from the .webp path
                const match = src.match(/-.{2}-(.+)\?/);

                // If the original image cannot be extracted, use the provided src path
                src = match ? `https://i.redd.it/${match[1]}` : src;

                imageDownloads.push(new ImageDownloadData({
                    url: src,
                    dimensions: await fetchImageDimensionsFromURL(src)
                }))
            }

            res.push(new GalleryDownloadData({
                imageDownloadDatas: imageDownloads
            }));
        }
        return res;
    };

    getPrimaryDownloadType(post: HTMLElement) {
        const postTypeAttr = post.getAttribute('post-type');
        if (postTypeAttr === 'video')
            return DownloadType.Video
        if (postTypeAttr === 'image')
            return DownloadType.Image
        if (postTypeAttr === 'gallery')
            return DownloadType.Gallery
        return null;
    };
}