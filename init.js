// TODO: Scrap this whole thing and move to TypeScript with a bundler and a front-end framework

const REFRESH_INTERVAL_MS = 500;
// There can be other resolutions apparently? One video had 220p somehow ¯\_(ツ)_/¯
const REDDIT_VIDEO_HEIGHTS = [2160, 1440, 1080, 720, 480, 360, 240];
const REDDIT_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

function permalinkToUrl(permalink) {
    return `https://reddit.com${permalink}`;
}

function nameFromPermalink(permalink) {
    const segments = permalink.split("/");
    if (segments.length < 6)
        return "";
    return segments[5]
}

function fileExtFromUrl(url) {
    const pattern = /\.\w{3,4}($|\?)/;
    const matches = url.match(pattern);
    return matches ? matches[0] : null;
}

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

async function fetchFileSize(url) {
    return fetch(url, { method: 'HEAD' })
        .then(response => {
            const fileSize = parseInt(response.headers.get('Content-Length'));
            return fileSize;
        })
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
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
    constructor(link, filenamePrefix = "file", quality = "", fileSize) {
        this.contentType = "Content"
        this.fileExt = "";
        this.filenamePrefix = filenamePrefix;
        this.link = link;
        this.quality = quality;
        this.fileSize = fileSize;
    }

    getFullFileName() {
        if (this.quality)
            return `${this.filenamePrefix}-${this.quality}${this.fileExt}`;
        return `${this.filenamePrefix}${this.fileExt}`;
    }

    download() {
        downloadContent(this.link, this.getFullFileName())
    }
}

class DownloadInfoVideo extends DownloadInfo {
    constructor(link, filenamePrefix = "video", quality, fileSize) {
        super(link, filenamePrefix, quality, fileSize);
        this.contentType = "Video";
        this.fileExt = ".mp4";
    }
}

class DownloadInfoAudio extends DownloadInfo {
    constructor(link, filenamePrefix = "audio", fileSize) {
        super(link, filenamePrefix, null, fileSize);
        this.contentType = "Audio";
        this.fileExt = ".mp4";
    }

    getFullFileName() {
        return `${this.filenamePrefix}-audio${this.fileExt}`
    }
}

class DownloadInfoImage extends DownloadInfo {
    constructor(link, filenamePrefix = "image", quality, fileSize) {
        super(link, filenamePrefix, quality, fileSize);
        this.fileExt = fileExtFromUrl(this.link) ?? ".png";
        const isGif = this.fileExt === ".gif";
        this.contentType = isGif ? "GIF" : "Image";
    }
}

class DownloadInfoGallery extends DownloadInfo {
    constructor(links, filenamePrefix = "image", folderPrefix = "gallery", fileSize) {
        super(null, filenamePrefix, null, fileSize);
        this.urls = links;
        this.contentType = "Gallery";
        this.folderPrefix = folderPrefix;
    }

    download() {
        function getRandomString(len) {
            const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            let res = ""
            for (let i = 0; i < len; i++) {
                const index = Math.floor(Math.random() * chars.length);
                res += chars.charAt(index);
            }
            return res
        }

        const folderName = `${this.folderPrefix}-${getRandomString(6)}`;
        for (const [i, url] of this.urls.entries()) {
            downloadContent(url, `${folderName}/${this.filenamePrefix}-${i + 1}${fileExtFromUrl(url)}`)
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

        const hasAudio = !!vidData?.has_audio;
        if (!hasAudio)
            audioUrl = null;

        const audioFileSize = hasAudio ? await fetchFileSize(audioUrl) : 0;
        const originalVideoFileSize = await fetchFileSize(fallbackUrl);
        const url = getRSUrl(postUrl, fallbackUrl, audioUrl)

        // Add the original video link
        downloads.push(
            new DownloadInfoVideo(url, data.filenamePrefix, `${originalHeight}p`, originalVideoFileSize + audioFileSize)
        )

        if (!matches)
            return downloads;

        // Add alternative resolutions
        for (const height of REDDIT_VIDEO_HEIGHTS) {
            if (height >= originalHeight)
                continue;
            const fallbackUrl = `${matches[1]}${height}${matches[3]}`;
            const url = getRSUrl(postUrl, fallbackUrl, audioUrl);
            const videoFileSize = await fetchFileSize(fallbackUrl);
            const downloadInfo = new DownloadInfoVideo(url, data.filenamePrefix, `${height}p`, videoFileSize + audioFileSize)
            downloads.push(downloadInfo)
        }

        if (hasAudio) {
            downloads.push(new DownloadInfoAudio(audioUrl, data.filenamePrefix, audioFileSize));
        }

        return downloads;
    }

    async function getGifvDownloads(data) {
        const downloads = [];
        const fallbackUrl = data?.preview?.reddit_video_preview?.fallback_url;
        const originalHeight = data?.preview?.images[0]?.source?.height;
        const fileSize = await fetchFileSize(fallbackUrl);

        // Add the original video link
        downloads.push(
            new DownloadInfoVideo(fallbackUrl, data.filenamePrefix, `${originalHeight}p`, fileSize)
        )

        // Check if the video URL matches the standard Reddit video URL pattern
        const dashRegexStandard = /(https:\/\/v\.redd\.it\/[\w-]+\/DASH_)(\d{3,4})(\.mp4.*)/;
        const matches = fallbackUrl.match(dashRegexStandard);
        if (matches.length === 0)
            return downloads;

        // TODO: Make it into its own function. It's basically the same code as in videos
        // Add alternative resolutions
        for (const height of REDDIT_VIDEO_HEIGHTS) {
            if (height >= originalHeight)
                continue;
            const url = `${matches[1]}${height}${matches[3]}`;
            const fileSize = await fetchFileSize(url);
            const downloadInfo = new DownloadInfoVideo(url, data.filenamePrefix, `${height}p`, fileSize)
            downloads.push(downloadInfo)
        }
        return downloads;
    }

    async function getImageDownloads(data) {
        const url = data.url;
        const sourceInfo = data?.preview?.images[0]?.source;
        const width = sourceInfo?.width;
        const height = sourceInfo?.height;
        const fileSize = await fetchFileSize(url);
        const quality = width && height ? `${width}x${height}` : null
        return [new DownloadInfoImage(url, data.filenamePrefix, quality, fileSize)];
    }

    async function getGalleryDownloads(data) {
        const metadata = data.media_metadata;
        const urls = [];

        // Get the keys in the right order
        const keys = data.gallery_data.items.map(item => item.media_id);

        let fileSizeSum = 0;
        for (const k of keys) {
            const ext = `.${metadata[k].m.split("/")[1]}`;
            const url = `https://i.redd.it/${k}${ext}`;
            fileSizeSum += await fetchFileSize(url);
            urls.push(url)
        }

        return [new DownloadInfoGallery(urls, data.filenamePrefix, `${data.filenamePrefix}`, fileSizeSum)];
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

                // TODO: Add support for the case when only the fallback source in the preview is avaliable
                // TODO: Also, refactor this mess
                if (data?.is_video)
                    downloads.push(...(await getVideoDownloads(data)));
                else if (REDDIT_IMAGE_EXTENSIONS.includes(urlExt))
                    downloads.push(...(await getImageDownloads(data)));
                else if (data?.preview?.reddit_video_preview?.fallback_url)
                    downloads.push(...await getGifvDownloads(data));
                else if (data?.is_gallery)
                    downloads.push(...await getGalleryDownloads(data));

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

    btn.classList.add("YszYBnnIoNY8pZ6UwCivd");


    btn.classList.add("v-dwnld-btn");
    btn.setAttribute("title", "Download original");
    btn.addEventListener("click", _ => {
        btn.blur();
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
    moreBtn.classList.add("YszYBnnIoNY8pZ6UwCivd");
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
        listElement.textContent = download.quality
            ? `Download ${download.quality} ${download.contentType}`
            : `Download ${download.contentType}`

        const sizeSpan = document.createElement("span");
        sizeSpan.textContent = `( ${formatFileSize(download.fileSize)})`;
        listElement.appendChild(sizeSpan);

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
        const leftOff = wrapperRect.right - bodyRect.left - dropdownRect.width;
        dropdown.style.top = `${topOff}px`;
        dropdown.style.left = `${leftOff}px`;
    }
    

    moreBtn.addEventListener("click", _ => {
        setDropdownActive(!dropdownActive)
        moreBtn.blur();
        if (!dropdownActive)
            return;
        updateDropdownPosition();
    })

    window.addEventListener("scroll", e => {
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