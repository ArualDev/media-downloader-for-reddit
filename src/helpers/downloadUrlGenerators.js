export function getRSUrl(baseUrl, fallbackUrl, audioUrl = null, alternative = false) {
    if (!audioUrl)
        audioUrl = "false";
    return `https://sd.rapidsave.com/download${alternative ? '-sd' : ''}.php?permalink=${baseUrl}&video_url=${fallbackUrl}&audio_url=${audioUrl}`;
}

export function getCustomServerUrl(fallbackUrl, audioUrl) {
    // TODO: Implement getting server address from options
    return `http:localhost:21370/combine?video_url=${fallbackUrl}&audio_url=${audioUrl}`;
}