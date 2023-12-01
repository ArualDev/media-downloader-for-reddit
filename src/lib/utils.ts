import Browser from "webextension-polyfill";
import type { MediaDimensions } from "../types/MediaDimensions";
import type { BaseDownloadable } from "./download-data/BaseDownloadable";
import { VideoDownloadable } from "./download-data/VideoDownloadable";
import type { RedditPostContentAPIData } from "../types/RedditPostContentAPIData";

export function postUrlFromPermalink(permalink: string): string {
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

    const result: BaseDownloadable[] = [];

    for (const permutation of permutations) {
        const source = permutation.source;
        result.push(new VideoDownloadable({
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

export async function fetchPostDataFromAPI(postUrl: string): Promise<RedditPostContentAPIData> {
    const responseObject = await Browser.runtime.sendMessage({
        action: 'fetch-json',
        url: postUrl
    });
    return (responseObject[0]?.data?.children[0]?.data as RedditPostContentAPIData);
}

export type VideoQualities = {
    video: number[],
    audio: number[]
};

export async function fetchVideoQualities(playlistUrl: string) {

    const result: VideoQualities = {
        video: [],
        audio: []
    };

    try {
        const playlistContent = await Browser.runtime.sendMessage({
            action: 'fetch-text',
            url: playlistUrl
        });

        const pattern = /<BaseURL>DASH_(\w+).mp4<\/BaseURL>/g;
        const matches = playlistContent.matchAll(pattern);

        for (const match of matches) {
            if (match[1].includes('AUDIO')) {
                result.audio.push(
                    Number(match[1].split('_')[1])
                );
                continue;
            }
            result.video.push(
                Number(match[1])
            );
        }

        result.video.sort((a, b) => b - a);
        result.audio.sort((a, b) => b - a);

        return result;
    } catch {
        return result;
    }
}

export function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1048576) return Math.round((bytes / 1024)) + 'KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + 'MB';
    return (bytes / 1073741824).toFixed(2) + 'GB';
}
