import type { DownloadType } from "../../constants";
import type { BaseDownloadData } from "../download-data/BaseDownloadData";

export default interface UIHandler {
    detectPosts: () => HTMLElement[];
    injectDownloadButton: (
        post: Element, downloads: BaseDownloadData[],
        onClick: (e: MouseEvent) => void,
        onClickMore: (e: MouseEvent) => void
    ) => void;
    upvote: (post: HTMLElement) => void;
    getPostURL: (post: HTMLElement) => string;
    getDownloads: (post: HTMLElement, downloadType?: DownloadType) => Promise<BaseDownloadData[]>;
    getPrimaryDownloadType: (post: HTMLElement) => DownloadType | null;
}