export default async function fetchVideoQualities(playlistUrl) {
    const vids = [];
    const audio = [];

    try {
        const fetchResult = await fetch(playlistUrl);
        const playlistContent = await fetchResult.text();

        const pattern = /<BaseURL>DASH_(\w+).mp4<\/BaseURL>/g;
        const matches = playlistContent.matchAll(pattern);

        for (const match of matches) {
            if (match[1].includes('AUDIO')) {
                audio.push(
                    Number(match[1].split('_')[1])
                );
                continue;
            }
            vids.push(
                Number(match[1])
            );
        }

        vids.sort((a, b) => b - a);
        audio.sort((a, b) => b - a);
        
        return {
            video: vids,
            audio: audio
        };
    } catch {
        return {
            video: vids,
            audio: audio
        };
    }
}