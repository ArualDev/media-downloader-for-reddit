import type DownloadData from "../types/DownloadData";
import { DownloadDataVideo } from "./download-data/DownloadDataVideo";

export function urlFromPermalink(permalink: string): string {
    return `https://reddit.com${permalink}`;
}

export function nameFromPermalink(permalink: string) {
    const segments = permalink.split('/');
    if (segments.length < 6)
        return '';
    return segments[5];
}

export function fileExtFromUrl(url: string) {
    const pattern = /(\.\w{3,4})($|\?)/;
    const matches = url.match(pattern);
    return matches ? matches[1] : null;
}

export async function getDownloadsFromPackagedMediaJSON(packedMediaJSON: string) {
    const data = (await JSON.parse(packedMediaJSON)) as RedditPackagedMediaData;
    const permutations = data?.playbackMp4s?.permutations;

    const result: DownloadData[] = [];

    for (const permutation of permutations) {
        const source = permutation.source;
        result.push(new DownloadDataVideo(source.url, source.dimensions.width, source.dimensions.height))
    }
    result.reverse();
    return result;
}