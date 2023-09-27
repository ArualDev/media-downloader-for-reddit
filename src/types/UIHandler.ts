import type { DownloadType } from "../constants";
import type DownloadData from "./DownloadData";

export default interface UIHandler {
    detectPosts: () => HTMLElement[];
    injectDownloadButton: (
        post: Element, downloads: DownloadData[],
        onClick: (e: MouseEvent) => void,
        onClickMore: (e: MouseEvent) => void
    ) => void;
    upvote: (post: HTMLElement) => void;
    getPostURL: (post: HTMLElement) => string;
    getDownloads: (post: HTMLElement, downloadType?: DownloadType) => Promise<DownloadData[]>;
    getPrimaryDownloadType: (post: HTMLElement) => DownloadType | null;
}