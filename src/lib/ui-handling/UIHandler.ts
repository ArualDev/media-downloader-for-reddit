import type { DownloadType } from "../../constants";
import type { BaseDownloadable } from "../downloadable/BaseDownloadable";

export default interface UIHandler {
    detectPosts: () => HTMLElement[];
    injectDownloadButton: (
        post: Element, downloads: BaseDownloadable[],
        onClick: (e: MouseEvent) => void,
        onClickMore: (e: MouseEvent) => void
    ) => void;
    upvote: (post: HTMLElement) => void;
    getPostURL: (post: HTMLElement) => string;
    getPostPermalink(post: HTMLElement): string;
    getDownloads: (post: HTMLElement, downloadType?: DownloadType) => Promise<BaseDownloadable[]>;
    getPrimaryDownloadType: (post: HTMLElement) => DownloadType | null;
}