import Browser from "webextension-polyfill";
import { fetchFileSizeFromURL } from "../utils";
import type { MediaDimensions } from "../../types/MediaDimensions";

export abstract class BaseDownloadable {

    url: string | null = null;
    fileSize: number | null = null;
    fileSizeFetched: boolean = false;
    dimensions: MediaDimensions = {
        width: null,
        height: null
    };

    get isValid() {
        return !(this.fileSizeFetched && !this.fileSize);
    }

    get qualityString(): string | null {
        if (!this.dimensions.height)
            return null;
        if (!this.dimensions.width)
            return `${this.dimensions.height}p`;
        return `${this.dimensions.width}x${this.dimensions.height}`
    }

    get downloadTypeName() {
        return 'File';
    }

    async fetchFileSize() {
        if (!this.url) {
            return;
        }
        this.fileSize = await fetchFileSizeFromURL(this.url);
        this.fileSizeFetched = true;
        return this.fileSize;
    }

    download() {
        Browser.runtime.sendMessage({
            action: 'download',
            url: this.url
        })
    }

}