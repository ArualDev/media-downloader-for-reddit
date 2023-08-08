import DownloadInfo from "./DownloadInfo";
import { fileExtFromUrl } from "../helpers/utils";

export default class DownloadInfoImage extends DownloadInfo {
    constructor(link, filenamePrefix = "image", quality, fileSize) {
        super(link, filenamePrefix, quality, fileSize);
        this.fileExt = fileExtFromUrl(this.link) ?? ".png";
        const isGif = this.fileExt === ".gif";
        this.contentType = isGif ? "GIF" : "Image";
    }
}