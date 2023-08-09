import { fetchFileSize, nameFromPermalink } from "../helpers/utils";
import DownloadInfoGallery from "../classes/DownloadInfoGallery";

export default async function getGalleryDownloads(data) {
    const metadata = data.media_metadata;
    const urls = [];

    // Get the keys in the right order
    const keys = data.gallery_data.items.map(item => item.media_id);

    let fileSizeSum = 0;
    for (const k of keys) {
        const ext = `.${metadata[k].m.split("/")[1]}`;
        const url = `https://i.redd.it/${k}${ext}`;
        fileSizeSum += await fetchFileSize(url);
        urls.push(url)
    }

    return [new DownloadInfoGallery(urls, nameFromPermalink(data?.permalink), data.filenamePrefix, fileSizeSum)];
}