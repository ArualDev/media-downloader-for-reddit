export function urlFromPermalink(permalink: string): string {
    return `https://reddit.com${permalink}`;
}

export function fileExtFromUrl(url: string) {
    const pattern = /(\.\w{3,4})($|\?)/;
    const matches = url.match(pattern);
    return matches ? matches[1] : null;
}
