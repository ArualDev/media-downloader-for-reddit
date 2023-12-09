import DownloadButton from "../../components/new-ui/DownloadButton.svelte";
import { DownloadType } from "../../constants";
import type UIHandler from "./UIHandler";
import { fetchImageDimensionsFromURL, getDownloadsFromPackagedMediaJSON, getOriginalImageFileNameFromUrl, postUrlFromPermalink, tryExtractRedditMediaUrl } from "../utils";
import type { BaseDownloadable } from "../downloadable/BaseDownloadable";
import { ImageDownloadable } from "../downloadable/ImageDownloadable";
import { GalleryDownloadable } from "../downloadable/GalleryDownloadable";
import type { VideoDownloadable } from "../downloadable/VideoDownloadable";

export default class NewUIHandler implements UIHandler {

    detectPosts() {
        const posts = document.querySelectorAll('shreddit-post');
        return [...posts] as HTMLElement[];
    }

    injectDownloadButton(post: Element, downloads: BaseDownloadable[], onClickMain: (e: MouseEvent) => void, onClickMore: (e: MouseEvent) => void) {
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
        const permalink = this.getPostPermalink(post);
        return postUrlFromPermalink(permalink);
    };

    getPostPermalink(post: HTMLElement) {
        const permalink = post.getAttribute('permalink')!;
        return permalink;
    }

    async getImageDownloadables(post: HTMLElement): Promise<ImageDownloadable[]> {
        const contentHref = post.getAttribute('content-href');
        if (!contentHref)
            return [];

        return [
            new ImageDownloadable({
                url: contentHref,
                dimensions: await fetchImageDimensionsFromURL(contentHref!)
            })
        ];
    }

    async getVideoDownloadables(post: HTMLElement): Promise<VideoDownloadable[]> {
        const player = post.querySelector('shreddit-player')
        const packedMediaJSON = player?.getAttribute('packaged-media-json');
        if (!packedMediaJSON)
            return [];
        return await getDownloadsFromPackagedMediaJSON(packedMediaJSON);
    }

    async getGalleryDownloadables(post: HTMLElement): Promise<GalleryDownloadable[]> {
        const imgElements = [...post.querySelectorAll('ul li a figure img')] as HTMLImageElement[];

        const imageDownloads: ImageDownloadable[] = [];


        for (const imgElement of imgElements) {
            // If the src is empty, it means the image has not been loaded, so read the url from 'data-lazy-src'
            let imageUrl = imgElement.src === ''
                ? imgElement.getAttribute('data-lazy-src')!
                : imgElement.src;

            imageUrl = tryExtractRedditMediaUrl(imageUrl, DownloadType.Image);

            imageDownloads.push(new ImageDownloadable({
                url: imageUrl,
                dimensions: await fetchImageDimensionsFromURL(imageUrl)
            }))
        }

        return [
            new GalleryDownloadable({
                imageDownloadables: imageDownloads
            })
        ];
    }

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