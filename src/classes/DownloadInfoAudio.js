import DownloadInfo from "./DownloadInfo";

export default class DownloadInfoAudio extends DownloadInfo {
    constructor(link, filenamePrefix = "audio", quality, fileSize) {
        super(link, filenamePrefix, quality, fileSize);
        this.contentType = "Audio";
        this.fileExt = ".mp4";
    }

    getFullFileName() {
        return `${this.filenamePrefix}-audio${this.fileExt}`
    }
}