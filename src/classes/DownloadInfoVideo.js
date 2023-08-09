import DownloadInfo from "./DownloadInfo";
import { getRSUrl, getCustomServerUrl } from "../helpers/downloadUrlGenerators";
import { loadOptions } from "../helpers/utils";

export default class DownloadInfoVideo extends DownloadInfo {
    constructor(videoUrl, audioUrl = null, filenamePrefix = "video", quality, fileSize) {
        super(null, filenamePrefix, quality, fileSize);
        this.videoUrl = videoUrl;
        this.audioUrl = audioUrl;
        this.contentType = "Video";
        this.fileExt = ".mp4";
    }

    async download(saveAs) {
        async function getUrl(info) {
            if (!info.audioUrl)
                return info.videoUrl

            const options = await loadOptions();

            return options.useCustomServer
                ? getCustomServerUrl(info.videoUrl, info.audioUrl, options.customServerAddress)
                : getRSUrl(info.postUrl, info.videoUrl, info.audioUrl, info.alternative)
        }

        this.link = await getUrl(this);
        super.download(saveAs);
    }
}