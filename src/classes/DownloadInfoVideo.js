import DownloadInfo from "./DownloadInfo";
import { getRSUrl, getCustomServerUrl } from "../helpers/downloadUrlGenerators";

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
                return videoUrl

            const options = (await browser.storage.sync.get('options'))?.options;

            if (options && options.useCustomServer) {
                return getCustomServerUrl(info.videoUrl, info.audioUrl)
            }
            return getRSUrl(info.postUrl, info.videoUrl, info.audioUrl, info.alternative);
        }

        this.link = await getUrl(this);
        super.download(saveAs);
    }
}