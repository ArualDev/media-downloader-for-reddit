import Browser from "webextension-polyfill";
import { BaseDownloadable } from "./BaseDownloadable";
import type { ImageDownloadable } from "./ImageDownloadable";

export type GalleryDownloadableProps = {
    imageDownloadables: ImageDownloadable[]
};

export class GalleryDownloadable extends BaseDownloadable {

    imageDownloadables: ImageDownloadable[];

    constructor(props: GalleryDownloadableProps) {
        super();
        this.imageDownloadables = props.imageDownloadables.filter(data => data.isValid);
        if (this.imageDownloadables.length === 0)
            return;
        this.dimensions = this.imageDownloadables[0].dimensions;
    }

    get isValid() {
        const AreAllElementsInvalid = this.imageDownloadables.every(data => !data.isValid);
        return super.isValid && !AreAllElementsInvalid;
    }

    get downloadTypeName() {
        return 'Gallery';
    }

    async fetchFileSize() {
        let sizeSum = 0;
        for (const imageDownloadData of this.imageDownloadables) {
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
        for (const imageDownloadData of this.imageDownloadables) {
            Browser.runtime.sendMessage({
                action: 'download',
                url: imageDownloadData.url
            })
        }
    }
}