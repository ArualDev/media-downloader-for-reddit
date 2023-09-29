import Browser from "webextension-polyfill";
import type DownloadData from "../../types/DownloadData";
import { fileExtFromUrl } from "../utils";
import { fetchFileSizeFromURL, fileExtFromUrl } from "../utils";

export class DownloadDataImage implements DownloadData {
    url: string;
    private _size: number | null = null;
    extension: string | null;
    dimensions: {
        width?: number,
        height?: number
    };
    
    constructor(url: string, width?: number, height?: number) {
        this.url = url;
        this.extension = fileExtFromUrl(url);
        this.dimensions = {
            width: width,
            height: height
        }
    }

    get isValid() {
        return this.extension !== null;
    }

    get qualityString() {
        if(!this.dimensions.height)
            return '';
        if(!this.dimensions.width)
            return `${this.dimensions.height}p`;
        return `${this.dimensions.width}x${this.dimensions.height}`
    }

    get name() {
        return this.extension === '.gif' ? 'GIF' : 'Image';
    }

    get fileSize() {
        return this._size;
    }

    async fetchFileSize() {
        this._size = await fetchFileSizeFromURL(this.url);
    }

    download() {
        Browser.runtime.sendMessage({
            action: 'download',
            url: this.url
        })
    } 
}