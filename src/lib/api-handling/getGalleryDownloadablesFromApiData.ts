import type { RedditPostContentAPIData } from "../../types/RedditPostContentAPIData";
import { ImageDownloadable } from "../downloadable/ImageDownloadable";
import { GalleryDownloadable } from "../downloadable/GalleryDownloadable";


export default async function getGalleryDownloadablesFromApiData(postAPIData: RedditPostContentAPIData) {
    const metadata = postAPIData.media_metadata;
    const imageDownloads: ImageDownloadable[] = [];

    // Get the keys in the right order
    const keys = (postAPIData.gallery_data.items as { media_id: string }[]).map(item => item.media_id);

    for (const k of keys) {
        const ext = `.${metadata[k].m.split("/")[1]}`;
        const url = `https://i.redd.it/${k}${ext}`;
        imageDownloads.push(new ImageDownloadable({
            url: url,
            dimensions: {
                width: metadata[k].s.x,
                height: metadata[k].s.y
            }
        }));
    }

    return [new GalleryDownloadable({
        imageDownloadables: imageDownloads
    })];
}