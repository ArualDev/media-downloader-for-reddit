import Browser from "webextension-polyfill";
import type DownloadData from "../../types/DownloadData";
import { fileExtFromUrl } from "../utils";

export class DownloadDataImage implements DownloadData {
    url: string;
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

    download() {
        Browser.runtime.sendMessage({
            action: 'download',
            url: this.url
        })
    } 
}