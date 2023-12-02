import type { MediaDimensions } from "../../types/MediaDimensions";
import { fileExtFromUrl } from "../utils";
import { BaseDownloadable } from "./BaseDownloadable";

export type ImageDownloadableProps = {
    url: string,
    dimensions?: MediaDimensions
};

export class ImageDownloadable extends BaseDownloadable {

    extension: string | null = null;
    isGIF: boolean = false;

    constructor(props: ImageDownloadableProps) {
        super();
        this.url = props.url;
        this.extension = fileExtFromUrl(this.url);
        this.dimensions = props.dimensions ?? { width: null, height: null };
        if (this.extension === '.gif') {
            this.isGIF = true;
        }
    }

    get isValid() {
        return super.isValid && this.extension !== null;
    }

    get downloadTypeName() {
        return this.isGIF ? 'GIF' : 'Image';
    }

}