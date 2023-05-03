const REFRESH_INTERVAL_MS = 500;
// There can be other resolutions apparently? One video had 220p somehow
const REDDIT_VIDEO_HEIGHTS = [2160, 1440, 1080, 720, 480, 360, 240];

function permalinkToUrl(permalink) {
    return `https://reddit.com${permalink}`;
}

function nameFromPermalink(permalink) {
    const pattern = /\/([\w-]+)\/$/;
    const matches = permalink.match(pattern)
    return matches[1];
}

function downloadContent(url, filename) {
    browser.runtime.sendMessage({
        action: "download",
        url: url,
        filename: filename
    });
}

function downloadContentRapidSave(baseUrl, fallbackUrl, audioUrl = "false", filename) {
    const url = `https://sd.rapidsave.com/download-sd.php?permalink=${baseUrl}&video_url=${fallbackUrl}&audio_url=${audioUrl}`;
    browser.runtime.sendMessage({
        action: "downloadRS",
        url: url,
        filename: filename
    });
}

// TODO: Is this class even necessary
class PostData {
    constructor(url, title, downloads) {
        this.url = url;
        this.title = title;
        this.downloads = downloads;
    }
}

class DownloadInfo {
    constructor(link, filenamePrefix = "file", quality = "") {
        this.contentType = "Content"
        this.fileExt = "";
        this.filenamePrefix = filenamePrefix;
        this.link = link;
        this.quality = quality;
    }

    getFullFileName() {
        return `${this.filenamePrefix}-${this.quality}${this.fileExt}`
    }

    download() {
        downloadContent(this.link, this.getFullFileName())
    }
}

class DownloadInfoVideo extends DownloadInfo {
    constructor(baseUrl, fallbackUrl, audioUrl, filenamePrefix = "video", quality) {
        super(null, filenamePrefix, quality);
        this.contentType = "Video";
        this.fileExt = ".mp4";
        this.baseUrl = baseUrl;
        this.audioUrl = audioUrl;
        this.fallbackUrl = fallbackUrl;
    }

    download() {
        downloadContentRapidSave(this.baseUrl, this.fallbackUrl, this.audioUrl, this.getFullFileName())
    }
}

class DownloadInfoAudio extends DownloadInfo {
    constructor(link, filenamePrefix = "audio") {
        super(link, filenamePrefix);
        this.contentType = "Audio";
        this.fileExt = ".mp4";
    }

    getFullFileName() {
        return `${this.filenamePrefix}-audio${this.fileExt}`
    }
}

class DownloadInfoGif extends DownloadInfo {
    constructor(link, filenamePrefix = "gif", quality) {
        super(link, filenamePrefix, quality);
        this.contentType = "GIF";
        this.fileExt = ".gif";
    }
}

class DownloadInfoGifv extends DownloadInfo {
    constructor(link, filenamePrefix = "gif_video", quality) {
        super(link, filenamePrefix, quality);
        this.contentType = "GIF Video";
        this.fileExt = ".mp4";
    }
}



async function fetchPostData(postUrl) {
    async function getVideoDownloads(data) {

        const downloads = [];
        const vidData = data.media?.reddit_video;
        if (!vidData)
            return downloads;

        const fallbackUrl = vidData?.fallback_url;

        const originalHeight = vidData?.height ?? null;

        // Check if the video URL matches the standard Reddit video URL pattern
        const dashRegexStandard = /(https:\/\/v\.redd\.it\/[\w-]+\/DASH_)(\d{3,4})(\.mp4.*)/;
        const matches = fallbackUrl.match(dashRegexStandard);

        let audioUrl = `${matches[1]}audio${matches[3]}`;
        // Check if the audio url file exists at that location.
        const response = await fetch(audioUrl);
        if (!response.ok)
            audioUrl = "false"

        // Add the original video link
        downloads.push(
            new DownloadInfoVideo(postUrl, fallbackUrl, audioUrl, data.filenamePrefix, `${originalHeight}p`)
        )


        if (matches.length === 0)
            return downloads;

        // Add alternative resolutions
        for (const height of REDDIT_VIDEO_HEIGHTS) {
            if (height >= originalHeight)
                continue;
            const url = `${matches[1]}${height}${matches[3]}`;
            const downloadInfo = new DownloadInfoVideo(postUrl, url, audioUrl, data.filenamePrefix, `${height}p`)
            downloads.push(downloadInfo)
        }

        if (response.ok) {
            downloads.push(new DownloadInfoAudio(audioUrl, data.filenamePrefix));
        }

        return downloads;
    }

    function getGifDownloads(data) {
        const url = data.url;
        const sourceInfo = data?.preview?.images[0]?.source;
        const width = sourceInfo?.width;
        const height = sourceInfo?.height;
        return [new DownloadInfoGif(url, data.filenamePrefix, `${width}x${height}`)];
    }

    function getGifvDownloads(data) {
        const downloads = [];
        const fallbackUrl = data?.preview?.reddit_video_preview?.fallback_url;
        const originalHeight = data?.preview?.images[0]?.source?.height;

        // Add the original video link
        downloads.push(
            new DownloadInfoGifv(fallbackUrl, data.filenamePrefix, `${originalHeight}p`)
        )

        // Check if the video URL matches the standard Reddit video URL pattern
        const dashRegexStandard = /(https:\/\/v\.redd\.it\/[\w-]+\/DASH_)(\d{3,4})(\.mp4.*)/;
        const matches = fallbackUrl.match(dashRegexStandard);
        if (matches.length === 0)
            return downloads;

        // Add alternative resolutions
        for (const height of REDDIT_VIDEO_HEIGHTS) {
            if (height >= originalHeight)
                continue;
            const url = `${matches[1]}${height}${matches[3]}`;
            const downloadInfo = new DownloadInfoGifv(url, data.filenamePrefix, `${height}p`)
            downloads.push(downloadInfo)
        }
        return downloads;
    }

    return new Promise(resolve => {
        fetch(`${postUrl}.json`)
            .then(response => response.json())
            .then(async data => {
                data = data[0]?.data?.children[0]?.data;
                const isCrosspost = !!data?.crosspost_parent_list;
                if (isCrosspost)
                    data = data.crosspost_parent_list[0]

                data.filenamePrefix = nameFromPermalink(data?.permalink);
                let downloads = [];

                const gifMatches = data?.url?.match(/\.gif\/?$/);
                const gifvMatches = data?.url?.match(/\.gifv\/?$/);

                if (data?.is_video)
                    downloads = await getVideoDownloads(data);
                else if (gifMatches)
                    downloads = getGifDownloads(data);
                else if (gifvMatches)
                    downloads = getGifvDownloads(data);

                const postData = new PostData(postUrl, data?.title, downloads);
                resolve(postData);
            });
    })
}

// TODO: Implement
function generateBtnElementNewUI() {

}

function handleInjectButton(postData, injectContainer) {
    function getBtnText(downloadData) {
        return `Download ${downloadData.contentType}`
    }

    const btnWrapper = document.createElement('div');
    btnWrapper.classList.add("v-dwnld-btn-wrapper");
    const btn = document.createElement('button');
    const icon = document.createElement('span');

    icon.textContent = "download";
    icon.classList.add("material-symbols-outlined");

    btn.textContent = getBtnText(postData.downloads[0]);
    btn.prepend(icon)


    btn.classList.add("v-dwnld-btn");
    btn.setAttribute("title", "Download original");
    btn.addEventListener("click", _ => {
        postData.downloads[0].download();
    })

    btnWrapper.append(btn);

    const moreBtn = document.createElement('button');
    moreBtn.setAttribute("title", "More download options");

    const moreIcon = document.createElement('span');
    moreIcon.textContent = "arrow_drop_down";
    moreIcon.classList.add("material-symbols-outlined");

    moreBtn.prepend(moreIcon)
    moreBtn.classList.add("v-dwnld-btn");
    btnWrapper.append(moreBtn);
    injectContainer.appendChild(btnWrapper)

    const dropdown = document.createElement("div");
    let dropdownActive = false;

    function setDropdownActive(state) {
        dropdownActive = state;
        dropdown.style.display = dropdownActive ? "inherit" : "none";
    }

    setDropdownActive(dropdownActive);

    dropdown.classList.add("v-dwnld-btn-dropdown");
    const dropDownList = document.createElement("ul");

    for (const download of postData.downloads) {
        const listElement = document.createElement("li");
        listElement.textContent = `Download ${download.quality} ${download.contentType}`;
        listElement.addEventListener("click", _ => {
            download.download();
        });
        dropDownList.appendChild(listElement);
    }
    dropdown.appendChild(dropDownList);

    document.body.appendChild(dropdown);

    function updateDropdownPosition() {
        const wrapperRect = btnWrapper.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        const topOff = wrapperRect.bottom - bodyRect.top;
        const leftOff = wrapperRect.left - bodyRect.left - dropdownRect.width / 2 + wrapperRect.width / 2;
        dropdown.style.top = `${topOff}px`
        dropdown.style.left = `${leftOff}px`
    }

    moreBtn.addEventListener("click", _ => {
        setDropdownActive(!dropdownActive)
        if (!dropdownActive)
            return;
        updateDropdownPosition();
    })

    document.addEventListener("click", e => {
        if (injectContainer.contains(e.target) || dropdown.contains(e.target))
            return;
        setDropdownActive(false)
    })

    window.addEventListener("resize", _ => {
        updateDropdownPosition();
    })
}

function handleFeed() {
    const feedPostContainer = document.querySelector('.rpBJOHq2PR60pnwJlUyP0')
        ?? document.querySelector('[data-scroller-first=""]')?.parentNode;
    if (!feedPostContainer)
        return;

    const posts = document.querySelectorAll('.scrollerItem, [data-testid="post-container"]');

    for (const p of posts) {
        if (p.getAttribute("vid-downloader-checked"))
            continue;
        p.setAttribute("vid-downloader-checked", true)

        const drawer = p.querySelector("._3-miAEojrCvx_4FQ8x3P-s");
        const permalink = p.querySelector("a[data-click-id=body]")?.getAttribute("href");
        if (!permalink)
            continue;

        const url = permalinkToUrl(permalink);
        const injectContainer = drawer.lastChild;
        fetchPostData(url)
            .then(postData => {
                if (!postData || postData.downloads.length === 0)
                    return;
                handleInjectButton(postData, injectContainer);
            })

    }
}

function handlePostNew() {
    const postContent = document.querySelector('shreddit-post');
    if (!postContent)
        return;

    if (postContent.getAttribute("vid-downloader-checked"))
        return;
    postContent.setAttribute("vid-downloader-checked", true)

    const url = permalinkToUrl(postContent.getAttribute("permalink"));

    const divs = postContent.shadowRoot.querySelectorAll("div");
    const drawer = divs[divs.length - 1]

    fetchPostData(url)
        .then(postData => {
            if (!postData || postData.downloads.length === 0)
                return;
            handleInjectButton(postData, drawer)
        })
}

function handlePost() {
    const postContent = document.querySelector('[data-test-id="post-content"]');
    if (!postContent) {
        handlePostNew();
        return;
    }

    if (postContent.getAttribute("vid-downloader-checked"))
        return;
    postContent.setAttribute("vid-downloader-checked", true)

    const url = postContent.baseURI;
    const drawer = postContent.querySelector("._3-miAEojrCvx_4FQ8x3P-s");

    fetchPostData(url)
        .then(postData => {
            if (!postData || postData.downloads.length === 0)
                return;
            handleInjectButton(postData, drawer.lastChild)
        })
}


function checkForChangesAndInject() {
    if (window.location.href.includes('/comments/')) {
        handlePost();
        return;
    }
    handleFeed();
}

// This is bad, but will work for now
setInterval(_ => {
    checkForChangesAndInject();
}, REFRESH_INTERVAL_MS);

checkForChangesAndInject();
