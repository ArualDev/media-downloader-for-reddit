import DownloadInfoImage from "../classes/DownloadInfoImage";
import { fetchFileSize } from "../helpers/utils";

export default async function getImageDownloads(data) {
    const url = data.url;
    const sourceInfo = data?.preview?.images[0]?.source;
    const width = sourceInfo?.width;
    const height = sourceInfo?.height;
    const fileSize = await fetchFileSize(url);
    const quality = width && height ? `${width}x${height}` : null;
    return [new DownloadInfoImage(url, data.filenamePrefix, quality, fileSize)];
}
