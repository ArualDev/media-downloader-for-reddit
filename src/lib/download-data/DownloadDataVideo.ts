import Browser from "webextension-polyfill";
import type DownloadData from "../../types/DownloadData";

export class DownloadDataVideo implements DownloadData {
    url: string;
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

    download() {
        Browser.runtime.sendMessage({
            action: 'download',
            url: this.url
        })
    } 
}