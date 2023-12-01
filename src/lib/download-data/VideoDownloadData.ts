import Browser from "webextension-polyfill";
import type { MediaDimensions } from "../../types/MediaDimensions";
import { fetchFileSizeFromURL } from "../utils";
import { BaseDownloadData } from "./BaseDownloadData";

export type VideoSourceUrls = {
    videoUrl: string,
    audioIncluded: boolean
} | {
    videoUrl: string,
    audioUrl: string
}

export type VideoDownloadDataProps = {
    videoSourceUrls: VideoSourceUrls,
    dimensions?: MediaDimensions
};

export class VideoDownloadData extends BaseDownloadData {

    videoUrl: string;
    audioUrl: string | null = null;
    hasAudio: boolean = false;


    constructor(props: VideoDownloadDataProps) {
        super();
        this.videoUrl = props.videoSourceUrls.videoUrl;
        if ('audioUrl' in props.videoSourceUrls) {
            this.audioUrl = props.videoSourceUrls.audioUrl;
            this.hasAudio = true;
        }
        if ('audioIncluded' in props.videoSourceUrls) {
            if (props.videoSourceUrls.audioIncluded)
                this.hasAudio = true;
        }

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

