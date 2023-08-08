import DownloadInfoImage from "../classes/DownloadInfoImage";
import { fetchFileSize } from "../helpers/utils";

export default async function getImageDownloads(data) {

    const getQualityString = (width, height) => `${width}x${height}`;
    const downloads = []

    if(!data?.preview?.images[0])
        return downloads;

    const url = data.url;
    const sourceInfo = data.preview.images[0].source;

    const fileSize = await fetchFileSize(url);

    const quality = sourceInfo.width && sourceInfo.height
        ? getQualityString(sourceInfo.width, sourceInfo.height)
        : null;

    downloads.push(new DownloadInfoImage(url, data.filenamePrefix, quality, fileSize));

    const alternativeQualitiesData = data.preview.images[0].resolutions.reverse();
    for (const imageInfo of alternativeQualitiesData) {
        const fileSize = await fetchFileSize(url);

        const quality = imageInfo.width && imageInfo.height
            ? getQualityString(imageInfo.width, imageInfo.height)
            : null;

        downloads.push(new DownloadInfoImage(url, data.filenamePrefix, quality, fileSize))
    }

    return downloads;
}
