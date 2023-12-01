import DownloadButton from "../../components/old-ui/DownloadButton.svelte";
import { DownloadType, redditImageExtensions } from "../../constants";
import type DownloadData from "../download-data/DownloadData";
import type UIHandler from "./UIHandler";
import { fileExtFromUrl, urlFromPermalink } from "../utils";
import type { BaseDownloadable } from "../download-data/BaseDownloadable";

export default class OldUIHandler implements UIHandler {
    detectPosts() {
        const posts = document.querySelectorAll('#siteTable.linklisting div.link');
        return [...posts] as HTMLElement[];
    }

    injectDownloadButton(post: Element, downloads: BaseDownloadable[], onClick: (e: MouseEvent) => void) {
        const buttonContainer = post.querySelector('.flat-list.buttons')!;
        new DownloadButton({
            target: buttonContainer,
            props: {
                text: 'download',
                downloads: downloads,
                onClick: onClick
            }
        })
    }

    upvote(post: HTMLElement) {
        const button = post.querySelector('.arrow.up') as HTMLElement | null;
        button?.click();
    }

    getPostURL(post: HTMLElement) {
        const permalink = post.getAttribute('data-permalink')!;
        return urlFromPermalink(permalink);
    };

    async getDownloads (post: HTMLElement) {
        return [];
    };

    getPrimaryDownloadType (post: HTMLElement) {     
        if(post.getAttribute('data-is-gallery') === 'true')
            return DownloadType.Gallery; 

        if(post.getAttribute('data-kind') === 'video')
            return DownloadType.Video;

        const ext = fileExtFromUrl(post.getAttribute('data-url')!)
        if(ext && redditImageExtensions.includes(ext))
            return DownloadType.Image;
        
        return null;
    };  
}
