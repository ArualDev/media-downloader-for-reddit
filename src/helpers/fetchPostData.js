import { nameFromPermalink, fileExtFromUrl } from "./utils";
import PostData from "../classes/PostData"
import getVideoDownloads from "../downloadGetters/getVideoDownloads";
import getImageDownloads from "../downloadGetters/getImageDownloads";
import getGalleryDownloads from "../downloadGetters/getGalleryDownloads";
import { REDDIT_IMAGE_EXTENSIONS } from "./constants";

export default async function fetchPostData(postUrl) {
    try {
        const response = await fetch(`${postUrl}.json?raw_json=1`);

        let data = await response.json();
        data = data[0]?.data?.children[0]?.data;

        // If the post is a crosspost, then set get the data from the original post
        const isCrosspost = !!data?.crosspost_parent_list;
        if (isCrosspost)
            data = data.crosspost_parent_list[0]

        data.filenamePrefix = nameFromPermalink(data?.permalink);
        const downloads = [];
        const urlExt = fileExtFromUrl(data.url);

        let method = async () => [];

        if (data?.is_video || data?.preview?.reddit_video_preview?.fallback_url)
            method = getVideoDownloads;
        else if (REDDIT_IMAGE_EXTENSIONS.includes(urlExt))
            method = getImageDownloads;
        else if (data?.is_gallery)
            method = getGalleryDownloads;

        downloads.push(...await method(data))

        const postData = new PostData(postUrl, data?.title, downloads);
        return postData;
    } catch (error) {
        throw error;
    }
}