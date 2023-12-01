import Browser from "webextension-polyfill";
import { BaseDownloadData } from "./BaseDownloadData";
import type { ImageDownloadData } from "./ImageDownloadData ";

export type GalleryDownloadDataProps = {
    imageDownloadDatas: ImageDownloadData[]
};

export class GalleryDownloadData extends BaseDownloadData {

    imageDownloadDatas: ImageDownloadData[];

    constructor(props: GalleryDownloadDataProps) {
        super();
        this.imageDownloadDatas = props.imageDownloadDatas.filter(data => data.isValid);
        if (this.imageDownloadDatas.length === 0)
            return;
        this.dimensions = this.imageDownloadDatas[0].dimensions;
    }

    get downloadTypeName() {
        return 'Gallery';
    }

    async fetchFileSize() {
        let sizeSum = 0;
        for (const imageDownloadData of this.imageDownloadDatas) {
            if (!imageDownloadData.fileSize)
                await imageDownloadData.fetchFileSize();
            if (!imageDownloadData.fileSize)
                return;
            sizeSum += imageDownloadData.fileSize;
        }
        this.fileSize = sizeSum;
        return this.fileSize;
    }

    download() {
        for (const imageDownloadData of this.imageDownloadDatas) {
            Browser.runtime.sendMessage({
                action: 'download',
                url: imageDownloadData.url
            })
        }
    }
}