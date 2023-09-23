import type { DownloadType } from "../constants";
import type DownloadData from "../types/DownloadData";
import type UIHandler from "../types/UIHandler"

export default class PostData {
    postElement: HTMLElement;
    uiHandler: UIHandler;
    postURL: string;
    downloads: DownloadData[] = [];
    primaryDownloadType: DownloadType | null = null;

    constructor(postElement: HTMLElement, uiHandler: UIHandler) {
        this.postElement = postElement;
        this.uiHandler = uiHandler;
        this.postURL = uiHandler.getPostURL(this.postElement);
        this.primaryDownloadType = uiHandler.getPrimaryDownloadType(this.postElement);
    }

    async getDownloadsFromUI() {
        if(!this.primaryDownloadType)
            return;
        const downloads = await this.uiHandler.getDownloads(this.postElement, this.primaryDownloadType);
        this.downloads.push(...downloads);
        return;
    }

    onDownload(data: DownloadData) {
        if(false) {
            this.uiHandler.upvote(this.postElement);
        }
    }

    async fetchDownloadsFromAPI() {
        this.downloads.push();
    }

}