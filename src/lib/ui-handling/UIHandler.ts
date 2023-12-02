import type { DownloadType } from "../../constants";
import type { BaseDownloadable } from "../downloadable/BaseDownloadable";
import type { GalleryDownloadable } from "../downloadable/GalleryDownloadable";
import type { ImageDownloadable } from "../downloadable/ImageDownloadable";
import type { VideoDownloadable } from "../downloadable/VideoDownloadable";

export default interface UIHandler {
    detectPosts(): HTMLElement[];
    injectDownloadButton(
        post: Element, downloads: BaseDownloadable[],
        onClick: (e: MouseEvent) => void,
        onClickMore: (e: MouseEvent) => void
    ): void;
    upvote(post: HTMLElement): void;
    getPostURL(post: HTMLElement): string;
    getPostPermalink(post: HTMLElement): string;

    getImageDownloadables(post: HTMLElement): Promise<ImageDownloadable[]>;
    getVideoDownloadables(post: HTMLElement): Promise<VideoDownloadable[]>;
    getGalleryDownloadables(post: HTMLElement): Promise<GalleryDownloadable[]>;

    getPrimaryDownloadType(post: HTMLElement): DownloadType | null;
}