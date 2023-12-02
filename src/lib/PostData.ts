import { DownloadType } from "../constants";
import type { BaseDownloadable } from "./downloadable/BaseDownloadable";
import getImageDownloadablesFromApiData from "./api-handling/getImageDownloadablesFromApiData";
import getGalleryDownloadablesFromApiData from "./api-handling/getGalleryDownloadablesFromApiData";
import getVideoDownloadablesFromApiData from "./api-handling/getVideoDownloadablesFromApiData";
import type UIHandler from "./ui-handling/UIHandler"
import { fetchPostContentFromApi, postUrlFromPermalink } from "./utils";

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

        const uiGetterFunctions = {
            [DownloadType.Image]: this.uiHandler.getImageDownloadables,
            [DownloadType.Video]: this.uiHandler.getVideoDownloadables,
            [DownloadType.Gallery]: this.uiHandler.getGalleryDownloadables,
        };

        this.downloads.push(...await uiGetterFunctions[this.primaryDownloadType](this.postElement));
    }

    async fetchDownloadsFromAPI() {
        if (!this.primaryDownloadType)
            return;

        const data = await fetchPostContentFromApi(this.postURL + '.json?raw_json=1');

        const ApiGetterFunctions = {
            [DownloadType.Image]: getImageDownloadablesFromApiData,
            [DownloadType.Video]: getVideoDownloadablesFromApiData,
            [DownloadType.Gallery]: getGalleryDownloadablesFromApiData,
        };

        this.downloads.push(...await ApiGetterFunctions[this.primaryDownloadType](data));
    }

    onDownload(data: BaseDownloadable) {
        // TODO: If an option to upvote posts when downloading set to true, upvote the post
        if (false) {
            this.uiHandler.upvote(this.postElement);
        }
    }

}