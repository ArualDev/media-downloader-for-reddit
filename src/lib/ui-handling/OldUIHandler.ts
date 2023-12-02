import DownloadButton from "../../components/old-ui/DownloadButton.svelte";
import { DownloadType, redditImageExtensions } from "../../constants";
import type UIHandler from "./UIHandler";
import { fetchImageDimensionsFromURL, fileExtFromUrl, getDownloadsFromPackagedMediaJSON, postUrlFromPermalink, tryExtractRedditMediaUrl } from "../utils";
import type { BaseDownloadable } from "../downloadable/BaseDownloadable";
import { GalleryDownloadable } from "../downloadable/GalleryDownloadable";
import { ImageDownloadable } from "../downloadable/ImageDownloadable";
import type { VideoDownloadable } from "../downloadable/VideoDownloadable";

export default class OldUIHandler implements UIHandler {
    detectPosts() {
        const posts = document.querySelectorAll('#siteTable.linklisting div.link');
        return [...posts] as HTMLElement[];
    }

    injectDownloadButton(post: Element, downloads: BaseDownloadable[], onClickMain: (e: MouseEvent) => void, onClickMore: (e: MouseEvent) => void) {
        const buttonContainer = post.querySelector('.flat-list.buttons')!;
        new DownloadButton({
            target: buttonContainer,
            props: {
                text: 'download',
                downloads: downloads,
                onClickMain: onClickMain,
                onClickMore: onClickMore
            }
        })
    }

    upvote(post: HTMLElement) {
        const button = post.querySelector('.arrow.up') as HTMLElement | null;
        button?.click();
    }

    getPostURL(post: HTMLElement) {
        const permalink = this.getPostPermalink(post);
        return postUrlFromPermalink(permalink);
    };

    getPostPermalink(post: HTMLElement): string {
        return post.getAttribute('data-permalink')!;
    }

    async getImageDownloadables(post: HTMLElement): Promise<ImageDownloadable[]> {
        const contentHref = post.getAttribute('data-url');
        if (!contentHref)
            return [];

        return [
            new ImageDownloadable({
                url: contentHref,
                dimensions: await fetchImageDimensionsFromURL(contentHref!)
            })
        ]
    }

    async getVideoDownloadables(post: HTMLElement): Promise<VideoDownloadable[]> {
        // There's no easy way of extracting video data from this version of the UI. Packaged Media URLs are not supported
        // and getting the video from the blob source is a whole another issue to solve, with the browser API not helping much.
        // Sticking with reddit API calls for now.
        return [];
    }

    async getGalleryDownloadables(post: HTMLElement): Promise<GalleryDownloadable[]> {
        const imgElements = [...post.querySelectorAll('.gallery-tiles div img')] as HTMLImageElement[];
        const imageDownloads: ImageDownloadable[] = [];
        for (const imgElement of imgElements) {
            const url = tryExtractRedditMediaUrl(imgElement.src, DownloadType.Image);

            imageDownloads.push(new ImageDownloadable({
                url: url,
                dimensions: await fetchImageDimensionsFromURL(url)
            }))
        }

        return [new GalleryDownloadable({
            imageDownloadables: imageDownloads
        })];
    }

    getPrimaryDownloadType(post: HTMLElement) {
        if (post.getAttribute('data-is-gallery') === 'true')
            return DownloadType.Gallery;

        if (post.getAttribute('data-kind') === 'video')
            return DownloadType.Video;

        const ext = fileExtFromUrl(post.getAttribute('data-url')!)
        if (ext && redditImageExtensions.includes(ext))
            return DownloadType.Image;

        return null;
    };
}
