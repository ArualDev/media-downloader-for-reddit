import DownloadInfo from "./DownloadInfo";
import { getRandomString, fileExtFromUrl, sendDownloadRequestToBackground } from "../helpers/utils";

export default class DownloadInfoGallery extends DownloadInfo {
    constructor(links, filenamePrefix = "image", folderPrefix = "gallery", fileSize) {
        super(null, filenamePrefix, null, fileSize);
        this.urls = links;
        this.contentType = "Gallery";
        this.folderPrefix = folderPrefix;
    }

    download(saveAs) {
        const folderName = `${this.folderPrefix}-${getRandomString(6)}`;
        for (const [i, url] of this.urls.entries()) {
            sendDownloadRequestToBackground(url, `${folderName}/${this.filenamePrefix}-${i + 1}${fileExtFromUrl(url)}`, saveAs)
        }
    }
}