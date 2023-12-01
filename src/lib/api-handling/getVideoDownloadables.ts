import type { RedditPostContentAPIData } from "../../types/RedditPostContentAPIData";
import { AudioDownloadable } from "../download-data/AudioDownloadable";
import type { BaseDownloadable } from "../download-data/BaseDownloadable";
import { VideoDownloadable } from "../download-data/VideoDownloadable";
import { fetchVideoQualities } from "../utils";

export default async function getVideoDownloadables(postAPIData: RedditPostContentAPIData) {
    const downloads: BaseDownloadable[] = [];

    const vidData = postAPIData.media?.reddit_video ?? postAPIData?.preview?.reddit_video_preview;
    if (!vidData)
        return downloads;

    const baseMediaUrl = vidData.fallback_url.match(/(https:\/\/v.redd.it\/\w{8,16}\/).+/)[1];
    const getDashUrl = (quality: number, isAudio = false) => `${baseMediaUrl}DASH_${isAudio ? 'AUDIO_' : ''}${quality}.mp4`;

    const qualities = await fetchVideoQualities(vidData.dash_url);

    let bestAudioUrl = qualities.audio.length > 0
        ? getDashUrl(qualities.audio[0], true) // URL to best-quality audio file
        : null;

    // Add all video qualities with audio to downloads
    for (const quality of qualities.video) {
        const videoUrl = getDashUrl(quality);

        const downloadable = new VideoDownloadable({
            videoSourceUrls: {
                videoUrl: videoUrl,
                audioUrl: bestAudioUrl ?? undefined,
                audioIncluded: bestAudioUrl !== null ?? undefined,
            },
            isAlternative: quality !== qualities.video[0],
            dimensions: {
                width: null,
                height: quality
            }
        })

        downloads.push(downloadable)
    }

    // Add all audio qualities to downloads
    for (const quality of qualities.audio) {
        const audioUrl = getDashUrl(quality, true);
        const downloadInfo = new AudioDownloadable({
            url: audioUrl,
            quality: quality
        })
        downloads.push(downloadInfo)
    }

    return downloads;

}