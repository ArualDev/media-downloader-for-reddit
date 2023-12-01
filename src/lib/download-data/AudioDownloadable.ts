import { BaseDownloadable } from "./BaseDownloadable";

export type AudioDownloadableProps = {
    url: string,
    quality?: number
};

export class AudioDownloadable extends BaseDownloadable {

    quality: number | null = null;

    constructor(props: AudioDownloadableProps) {
        super();
        this.url = props.url;
        this.quality = props.quality ?? null;
    }

    get isValid() {
        return super.isValid;
    }

    get downloadTypeName() {
        return 'Audio'
    }

    get qualityString(): string | null {
        return `${this.quality}Kbps`
    }

}