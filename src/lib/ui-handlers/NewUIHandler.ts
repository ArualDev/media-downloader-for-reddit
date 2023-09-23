import DownloadButton from "../../components/new-ui/DownloadButton.svelte";
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


export default class NewUIHandler implements UIHandler {

    detectPosts() {
        const posts = document.querySelectorAll('shreddit-post');
        return [...posts] as HTMLElement[];
    }

    injectDownloadButton(post: Element, downloads: DownloadData[], onClick: (e: MouseEvent) => void) {
        const buttonContainer = post.shadowRoot?.querySelector('shreddit-post-share-button')?.parentElement!;
        new DownloadButton({
            target: buttonContainer,
            props: {
                text: 'Download',
                downloads: downloads,
                onClick: onClick
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
            if (packedMediaJSON) {
                const data = await JSON.parse(packedMediaJSON);
                const sourceArray = data?.playbackMp4s?.permutations;
                for (const source of sourceArray) {
                    res.push(new TestDownloadData(source.source.url))
                }
                res.reverse();
            }
        }

        if (downloadType === DownloadType.Image) {
            const contentHref = post.getAttribute('content-href');
            if (contentHref)
                res.push(new TestDownloadData(contentHref));
        }

        if (downloadType === DownloadType.Gallery) {
            const imgElements = post.querySelectorAll('li img');
            for(const imgElement of imgElements) {
                const src = imgElement.getAttribute('src')!;
                const match = src.match(/-.{2}-(.+)\?/);
                if(!match)
                    continue;
                res.push(new TestDownloadData(`https://i.redd.it/${match[1]}`))
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