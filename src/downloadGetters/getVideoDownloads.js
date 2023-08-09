import DownloadInfoVideo from "../classes/DownloadInfoVideo";
import DownloadInfoAudio from "../classes/DownloadInfoAudio";
import { permalinkToUrl, fetchFileSize } from "../helpers/utils";
import fetchVideoQualities from "../helpers/fetchVideoQualities";

export default async function getVideoDownloads(data) {
    const downloads = [];

    const vidData = data.media?.reddit_video ?? data?.preview?.reddit_video_preview;
    if (!vidData)
        return downloads;

    const baseMediaUrl = vidData.fallback_url.match(/(https:\/\/v.redd.it\/\w{8,16}\/).+/)[1];
    const getDashUrl = (quality, isAudio = false) => `${baseMediaUrl}DASH_${isAudio ? 'AUDIO_' : ''}${quality}.mp4`;

    const qualities = await fetchVideoQualities(vidData.dash_url);

    let bestAudioUrl = qualities.audio.length > 0
        ? getDashUrl(qualities.audio[0], true) // URL to best-quality audio file
        : null;

    const bestAudioFileSize = bestAudioUrl ? await fetchFileSize(bestAudioUrl) : 0;

    // If couldn't properly fetch the audio file, discard audio
    if (bestAudioFileSize === 0)
        bestAudioUrl = null;

    // Add all video qualities with audio to downloads
    for (const quality of qualities.video) {
        const videoUrl = getDashUrl(quality);
        const videoFileSize = await fetchFileSize(videoUrl);
        if (!videoFileSize)
            continue;
        const downloadInfo = new DownloadInfoVideo(videoUrl, bestAudioUrl, data.filenamePrefix, `${quality}p`, videoFileSize + bestAudioFileSize);

        // Add postUrl and a flag to distinguish between original quality and alternatives. Why, rapid? Just why?
        downloadInfo.postUrl = permalinkToUrl(data.permalink);
        downloadInfo.alternative = quality !== qualities.video[0];

        downloads.push(downloadInfo)
    }

    // Add all audio qualities to downloads
    for (const quality of qualities.audio) {
        const audioUrl = getDashUrl(quality, true);
        const audioFileSize = audioUrl !== bestAudioUrl // The original audio file size is fetched already
            ? await fetchFileSize(audioUrl) 
            : bestAudioFileSize

        if (!audioFileSize)
            continue;
        const downloadInfo = new DownloadInfoAudio(audioUrl, data.filenamePrefix, `${quality}Kbps`, audioFileSize + bestAudioFileSize)
        downloads.push(downloadInfo)
    }

    return downloads;
}