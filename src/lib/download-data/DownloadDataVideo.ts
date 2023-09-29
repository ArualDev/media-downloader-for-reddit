import Browser from "webextension-polyfill";
import type DownloadData from "./DownloadData";
import { fetchFileSizeFromURL } from "../utils";

export class DownloadDataVideo implements DownloadData {
    url: string;
    private _size: number | null = null;
    dimensions: {
        width?: number,
        height?: number
    };
    
    constructor(url: string, width?: number, height?: number) {
        this.url = url;
        this.dimensions = {
            width: width,
            height: height
        }
    }

    get isValid() {
        return true;
    }

    get qualityString() {
        if(!this.dimensions.height)
            return '';
        return `${this.dimensions.height}p`
    }

    get name() {
        return 'Video'
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