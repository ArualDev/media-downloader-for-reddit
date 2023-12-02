import { DownloadType } from "../constants";
import type { BaseDownloadable } from "./downloadable/BaseDownloadable";
import getImageDownloadablesFromApiData from "./api-handling/getImageDownloadablesFromApiData";
import getGalleryDownloadablesFromApiData from "./api-handling/getGalleryDownloadablesFromApiData";
import getVideoDownloadablesFromApiData from "./api-handling/getVideoDownloadablesFromApiData";
import type UIHandler from "./ui-handling/UIHandler"
import { fetchPostContentFromAPI, postUrlFromPermalink } from "./utils";

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

        const data = await fetchPostContentFromAPI(this.postURL + '.json?raw_json=1');

        if (this.primaryDownloadType === DownloadType.Image) {
            this.downloads.push(...await getImageDownloadables(data));
        }
        if (this.primaryDownloadType === DownloadType.Video) {
            this.downloads.push(...await getVideoDownloadables(data));
        }
        if (this.primaryDownloadType === DownloadType.Gallery) {
            this.downloads.push(...await getGalleryDownloadables(data));
        }
    }

}