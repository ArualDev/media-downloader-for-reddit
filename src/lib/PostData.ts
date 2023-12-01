import type { DownloadType } from "../constants";
import type { BaseDownloadable } from "./download-data/BaseDownloadable";
import type UIHandler from "./ui-handling/UIHandler"
import { postUrlFromPermalink } from "./utils";

export default class PostData {
    postElement: HTMLElement;
    uiHandler: UIHandler;
    postURL: string;
    permalink: string;
    downloads: BaseDownloadable[] = [];
    primaryDownloadType: DownloadType | null = null;

    constructor(postElement: HTMLElement, uiHandler: UIHandler) {
        this.postElement = postElement;
        this.uiHandler = uiHandler;
        this.permalink = uiHandler.getPostPermalink(this.postElement);
        this.postURL = postUrlFromPermalink(this.permalink);
        this.primaryDownloadType = uiHandler.getPrimaryDownloadType(this.postElement);
    }

    async getDownloadsFromUI() {
        if (!this.primaryDownloadType)
            return;
        const downloads = await this.uiHandler.getDownloads(this.postElement, this.primaryDownloadType);
        this.downloads.push(...downloads);
        return;
    }

    onDownload(data: BaseDownloadable) {
        // TODO: If an option to upvote posts when downloading set to true, upvote the post
        if (false) {
            this.uiHandler.upvote(this.postElement);
        }
    }

    async fetchDownloadsFromAPI() {
        this.downloads.push();
    }

}