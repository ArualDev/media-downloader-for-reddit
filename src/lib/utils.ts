import Browser from "webextension-polyfill";
import type { MediaDimensions } from "../types/MediaDimensions";
import type { BaseDownloadable } from "./download-data/BaseDownloadable";
import { VideoDownloadable } from "./download-data/VideoDownloadable";

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

    const result: BaseDownloadData[] = [];

    for (const permutation of permutations) {
        const source = permutation.source;
        result.push(new VideoDownloadData({
            videoSourceUrls: {
                videoUrl: source.url,
                audioIncluded: true
            },
            dimensions: source.dimensions
        }))
    }
    result.reverse();
    return result;
}

export async function fetchImageDimensionsFromURL(url: string): Promise<MediaDimensions> {
    const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', err => reject(err));
        img.src = url;
    });

    try {
        const img = await loadImage(url);
        return {
            width: img.naturalWidth,
            height: img.naturalHeight
        }
    } catch {
        return {
            width: null,
            height: null
        }
    }
}

export async function fetchFileSizeFromURL(url: string): Promise<number | null> {
    return await Browser.runtime.sendMessage({
        action: 'fetch-file-size',
        url: url
    });
}

export function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1048576) return Math.round((bytes / 1024)) + 'KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + 'MB';
    return (bytes / 1073741824).toFixed(2) + 'GB';
}
