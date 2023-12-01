import Browser from "webextension-polyfill";
import type { MediaDimensions } from "../../types/MediaDimensions";
import { fetchFileSizeFromURL } from "../utils";
import { BaseDownloadable } from "./BaseDownloadable";

export type VideoSourceUrls = {
    videoUrl: string,
    audioUrl?: string,
    audioIncluded?: boolean
}

export type VideoDownloadableProps = {
    videoSourceUrls: VideoSourceUrls,
    dimensions?: MediaDimensions,
    isAlternative?: boolean,
};

export class VideoDownloadable extends BaseDownloadable {

    videoUrl: string;
    isAlternative: boolean = false;
    audioUrl: string | null = null;
    hasAudio: boolean = false;


    constructor(props: VideoDownloadableProps) {
        super();
        this.videoUrl = props.videoSourceUrls.videoUrl;

        this.audioUrl = props.videoSourceUrls.audioUrl ?? null;
        this.hasAudio = true;

        if (props.videoSourceUrls.audioIncluded)
            this.hasAudio = true;

        this.isAlternative = props.isAlternative ?? false;
        this.dimensions = props.dimensions ?? { width: null, height: null };
    }

    get qualityString() {
        if (!this.dimensions.height)
            return null;
        return `${this.dimensions.height}p`
    }

    get downloadTypeName() {
        return 'Video';
    }

    async fetchFileSize() {
        if (!this.videoUrl) {
            return null;
        }
        let fileSize = await fetchFileSizeFromURL(this.videoUrl);

        if (fileSize && this.audioUrl)
            fileSize += await fetchFileSizeFromURL(this.audioUrl) ?? 0;

        this.fileSize = fileSize;
        this.fileSizeFetched = true;
        return this.fileSize;
    }

    download() {
        Browser.runtime.sendMessage({
            action: 'download',
            url: this.videoUrl
        })
    }

}

