import type { MediaDimensions } from "../../types/MediaDimensions";
import type { RedditPostContentAPIData } from "../../types/RedditPostContentAPIData";
import { ImageDownloadable } from "../download-data/ImageDownloadable";

export default async function getImageDownloadables(postAPIData: RedditPostContentAPIData) {
    const downloads = []

    const url = postAPIData.url;
    const sourceInfo = postAPIData?.preview?.images[0]?.source;

    const dimensions: MediaDimensions = {
        width: sourceInfo?.width,
        height: sourceInfo?.height
    };

    downloads.push(new ImageDownloadable({
        url: url,
        dimensions: dimensions
    }))

    const alternativeQualitiesData = postAPIData?.preview?.images[0]?.resolutions?.reverse() ?? [];
    for (const imageInfo of alternativeQualitiesData) {
        const url = imageInfo.url;

        const dimensions: MediaDimensions = {
            width: imageInfo?.width,
            height: imageInfo?.height
        };

        downloads.push(new ImageDownloadable({
            url: url,
            dimensions: dimensions
        }))
    }

    return downloads;
}