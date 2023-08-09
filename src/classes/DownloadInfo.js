import { sendDownloadRequestToBackground } from "../helpers/utils";

export default class DownloadInfo {
    constructor(link, filenamePrefix = "file", quality = "", fileSize) {
        this.contentType = "Content"
        this.fileExt = "";
        this.filenamePrefix = filenamePrefix;
        this.link = link;
        this.quality = quality;
        this.fileSize = fileSize;
    }

    getFullFileName() {
        if (this.quality)
            return `${this.filenamePrefix}-${this.quality}${this.fileExt}`;
        return `${this.filenamePrefix}${this.fileExt}`;
    }

    download(saveAs = false) {
        sendDownloadRequestToBackground(this.link, this.getFullFileName(), saveAs)
    }
}