const REFRESH_INTERVAL_MS = 500;
// There can be other resolutions apparently? One video had 220p somehow ¯\_(ツ)_/¯
const REDDIT_VIDEO_HEIGHTS = [2160, 1440, 1080, 720, 480, 360, 240];
const REDDIT_IMAGE_EXTENSIONS = [".jpg", ".png", ".webp"];

function permalinkToUrl(permalink) {
    return `https://reddit.com${permalink}`;
}

function nameFromPermalink(permalink) {
    const pattern = /\/([\w-]+)\/$/;
    const matches = permalink.match(pattern)
    return matches[1];
}

function fileExtFromUrl(url) {
    const pattern = /\.\w{3,4}($|\?)/;
    const matches = url.match(pattern);
    return matches ? matches[0] : null;
}

fileExtFromUrl("https://i.redd.it/award_images/t5_22cerq/18mwqw5th9e51_MURICA.png");

function downloadContent(url, filename) {
    browser.runtime.sendMessage({
        action: "download",
        url: url,
        filename: filename
    });
}

function getRSUrl(baseUrl, fallbackUrl, audioUrl = "false") {
    if (!audioUrl)
        audioUrl = "false";
    return `https://sd.rapidsave.com/download-sd.php?permalink=${baseUrl}&video_url=${fallbackUrl}&audio_url=${audioUrl}`;
}

// TODO: Is this class even necessary
class PostData {
    constructor(url, title, downloads) {
        this.url = url;
        this.title = title;
        this.downloads = downloads;
    }
}

// TODO: Add file size. Should be possible with a simple http request.
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
    constructor(link, filenamePrefix = "video", quality) {
        super(link, filenamePrefix, quality);
        this.contentType = "Video";
        this.fileExt = ".mp4";
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

class DownloadInfoImage extends DownloadInfo {
    constructor(link, filenamePrefix = "image", quality) {
        super(link, filenamePrefix, quality);
        this.contentType = "Image";
        this.fileExt = fileExtFromUrl(this.link);
        if(!this.fileExt in REDDIT_IMAGE_EXTENSIONS)
            this.fileExt = ".png";        
    }
}

class DownloadInfoGallery extends DownloadInfo {
    constructor(links, filenamePrefix = "image") {
        super(null, filenamePrefix);
        this.urls = links;
        this.contentType = "Gallery";
        this.fileExt = ".webp";
    }

    download() {
        for (const [i, url] of this.urls.entries()) {
            downloadContent(url, `${this.filenamePrefix}-${i + 1}${this.fileExt}`)
        }
    }
}

// TODO: Add support for downloading galleries as .zip files

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
        const hasAudio = (await fetch(audioUrl)).ok;
        if (!hasAudio)
            audioUrl = null;

        const url = getRSUrl(postUrl, fallbackUrl, audioUrl)

        // Add the original video link
        downloads.push(
            new DownloadInfoVideo(url, data.filenamePrefix, `${originalHeight}p`)
        )

        if (!matches)
            return downloads;

        // Add alternative resolutions
        for (const height of REDDIT_VIDEO_HEIGHTS) {
            if (height >= originalHeight)
                continue;
            const fallbackUrl = `${matches[1]}${height}${matches[3]}`;
            const url = getRSUrl(postUrl, fallbackUrl, audioUrl);
            const downloadInfo = new DownloadInfoVideo(url, data.filenamePrefix, `${height}p`)
            downloads.push(downloadInfo)
        }

        if (hasAudio) {
            downloads.push(new DownloadInfoAudio(audioUrl, data.filenamePrefix));
        }

        return downloads;
    }

    function getGifvDownloads(data) {
        const downloads = [];
        const fallbackUrl = data?.preview?.reddit_video_preview?.fallback_url;
        const originalHeight = data?.preview?.images[0]?.source?.height;

        // Add the original video link
        downloads.push(
            new DownloadInfoVideo(fallbackUrl, data.filenamePrefix, `${originalHeight}p`)
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
            const downloadInfo = new DownloadInfoVideo(url, data.filenamePrefix, `${height}p`)
            downloads.push(downloadInfo)
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

    function getImageDownloads(data) {
        const url = data.url;
        const sourceInfo = data?.preview?.images[0]?.source;
        const width = sourceInfo?.width;
        const height = sourceInfo?.height;
        return [new DownloadInfoImage(url, data.filenamePrefix, `${width}x${height}`)];
    }

    function getGalleryDownloads(data) {
        const metadata = data.media_metadata;
        const urls = [];
        for (const m of Object.values(metadata)) {
            const url = m.s.u;
            urls.push(url) 
        }
        const folderName = `${data.filenamePrefix}-${data.id}`;
        return [new DownloadInfoGallery(urls, `${folderName}/${data.filenamePrefix}`)];
    }

    return new Promise(resolve => {
        fetch(`${postUrl}.json?raw_json=1`)
            .then(response => response.json())
            .then(async data => {
                data = data[0]?.data?.children[0]?.data;
                const isCrosspost = !!data?.crosspost_parent_list;
                if (isCrosspost)
                    data = data.crosspost_parent_list[0]

                data.filenamePrefix = nameFromPermalink(data?.permalink);
                const downloads = [];

                const urlExt = fileExtFromUrl(data.url);

                if (data?.is_video)
                    downloads.push(...(await getVideoDownloads(data)));
                else if (urlExt === ".gif")
                    downloads.push(...getGifDownloads(data));
                else if (REDDIT_IMAGE_EXTENSIONS.includes(urlExt))
                    downloads.push(...getImageDownloads(data));
                else if (urlExt === ".gifv")
                    downloads.push(...getGifvDownloads(data));
                else if (data?.is_gallery)
                    downloads.push(...getGalleryDownloads(data));


                const postData = new PostData(postUrl, data?.title, downloads);
                resolve(postData);
            });
    })
}

// TODO: Implement
function generateBtnElementNewUI() {

}

// TODO: Refactor this
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
    
    injectContainer.appendChild(btnWrapper)

    // if(postData.downloads.length === 1)
    //     return;
    const moreBtn = document.createElement('button');
    moreBtn.setAttribute("title", "More download options");

    const moreIcon = document.createElement('span');
    moreIcon.textContent = "arrow_drop_down";
    moreIcon.classList.add("material-symbols-outlined");

    moreBtn.prepend(moreIcon)
    moreBtn.classList.add("v-dwnld-btn");
    btnWrapper.append(moreBtn);

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