import DownloadButton from "../../components/new-ui/DownloadButton.svelte";
import { DownloadType } from "../../constants";
import type DownloadData from "../../types/DownloadData";
import type UIHandler from "../../types/UIHandler";
import { DownloadDataImage } from "../download-data/DownloadDataImage";
import { DownloadDataVideo } from "../download-data/DownloadDataVideo";
import { getDownloadsFromPackagedMediaJSON, urlFromPermalink } from "../utils";

export default class NewUIHandler implements UIHandler {

    detectPosts() {
        const posts = document.querySelectorAll('shreddit-post');
        return [...posts] as HTMLElement[];
    }

    injectDownloadButton(post: Element, downloads: DownloadData[], onClick: (e: MouseEvent) => void, onClickMore: (e: MouseEvent) => void) {
        const buttonContainer = post.shadowRoot?.querySelector('shreddit-post-share-button')?.parentElement!;
        new DownloadButton({
            target: buttonContainer,
            props: {
                text: 'Download',
                downloads: downloads,
                onClickMain: onClick,
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
        const res: DownloadData[] = [];

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
            const aspectRatio = Number((post.querySelector('shreddit-aspect-ratio') as HTMLElement)?.style.getPropertyValue('--aspect-ratio'));
            const width = match ? parseInt(match[1]) : undefined;
            const height = width ? width * aspectRatio : undefined;

            if (contentHref)
                res.push(new DownloadDataImage(contentHref, width, height));
        }

        if (downloadType === DownloadType.Gallery) {
            const imgElements = post.querySelectorAll('li img');
            for (const imgElement of imgElements) {
                const src = imgElement.getAttribute('src')!;

                // Extract the original image from the .webp path
                const match = src.match(/-.{2}-(.+)\?/);
                if (!match) {
                    // If the original image cannot be extracted, use the provided src path
                    res.push(new DownloadDataImage(src))
                    continue;
                }
                res.push(new DownloadDataImage(`https://i.redd.it/${match[1]}`))
            }
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