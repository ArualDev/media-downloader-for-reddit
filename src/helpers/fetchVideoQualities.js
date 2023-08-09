export default async function fetchVideoQualities(playlistUrl) {

    const result = {
        video: [],
        audio: []
    };

    try {
        const fetchResult = await fetch(playlistUrl);
        const playlistContent = await fetchResult.text();

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