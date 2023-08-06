// Watch out! You are about to look at some spaghetti code 🍝
// TODO: Scrap this whole thing and move to TypeScript with a bundler and a front-end framework

const REFRESH_INTERVAL_MS = 500;
const REDDIT_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

async function log(msg) {
    const options = await browser.storage.sync.get('options')
    if (!options || !options.options.enableLogging)
        return;

    console.log(`Media Downloader for Reddit v${await getVersion()} - ${msg}`);
}

function getRandomString(len) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let res = ""
    for (let i = 0; i < len; i++) {
        const index = Math.floor(Math.random() * chars.length);
        res += chars.charAt(index);
    }
    return res
}

async function getVersion() {
    return await browser.runtime.sendMessage({
        action: "getVersion",
    });
}

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

function downloadContent(url, filename, saveAs = false) {
    log(`Download request: \nURL:\t${url}\nFile name:\t${filename}`)
    browser.runtime.sendMessage({
        action: "download",
        url: url,
        filename: filename,
        saveAs: saveAs
    });
}

function getRSUrl(baseUrl, fallbackUrl, audioUrl = null, alternative = false) {
    if (!audioUrl)
        audioUrl = "false";
    return `https://sd.rapidsave.com/download${alternative ? '-sd' : ''}.php?permalink=${baseUrl}&video_url=${fallbackUrl}&audio_url=${audioUrl}`;
}

function getCustomServerUrl(fallbackUrl, audioUrl) {
    return `http:localhost:21370/combine?video_url=${fallbackUrl}&audio_url=${audioUrl}`;
}

async function fetchFileSize(url) {
    return fetch(url, { method: 'HEAD' })
        .then(response => {
            if (!response.ok)
                return null;
            const fileSize = parseInt(response.headers.get('Content-Length'));
            return fileSize;
        })
}

async function fetchVideoQualities(playlistUrl) {
    return fetch(playlistUrl)
        .then(res => res.text())
        .then(res => {
            const pattern = /<BaseURL>DASH_(\w+).mp4<\/BaseURL>/g;
            const matches = res.matchAll(pattern);

            const vids = [];
            const audio = [];

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
        })
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
}

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

    download(saveAs = false) {
        downloadContent(this.link, this.getFullFileName(), saveAs)
    }
}

class DownloadInfoVideo extends DownloadInfo {
    constructor(videoUrl, audioUrl = null, filenamePrefix = "video", quality, fileSize) {
        super(null, filenamePrefix, quality, fileSize);
        this.videoUrl = videoUrl;
        this.audioUrl = audioUrl;
        this.contentType = "Video";
        this.fileExt = ".mp4";
    }

    async download(saveAs) {
        async function getUrl(videoUrl, audioUrl, postUrl) {
            if (!audioUrl)
                return videoUrl

            const options = (await browser.storage.sync.get('options'))?.options;

            if (options && options.useCustomServer) {
                return getCustomServerUrl(videoUrl, audioUrl)
            }
            return getRSUrl(postUrl, videoUrl, audioUrl, false);
        }

        this.link = await getUrl(this.videoUrl, this.audioUrl, this.postUrl);
        super.download(saveAs);
    }
}

class DownloadInfoAudio extends DownloadInfo {
    constructor(link, filenamePrefix = "audio", quality, fileSize) {
        super(link, filenamePrefix, quality, fileSize);
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

    download(saveAs) {
        const folderName = `${this.folderPrefix}-${getRandomString(6)}`;
        for (const [i, url] of this.urls.entries()) {
            downloadContent(url, `${folderName}/${this.filenamePrefix}-${i + 1}${fileExtFromUrl(url)}`, saveAs)
        }
    }
}

async function getVideoDownloads(data) {
    const downloads = [];

    const vidData = data.media?.reddit_video ?? data?.preview?.reddit_video_preview;
    if (!vidData)
        return downloads;

    const baseMediaUrl = vidData.dash_url.slice(0, -16)
    const getDashUrl = (quality, isAudio = false) => `${baseMediaUrl}DASH_${isAudio ? 'AUDIO_' : ''}${quality}.mp4`;

    const qualities = await fetchVideoQualities(vidData.dash_url);

    let bestAudioUrl = qualities.audio.length > 0
        ? getDashUrl(qualities.audio[0], true) // URL to best-quality audio file
        : null;

    const bestAudioFileSize = bestAudioUrl ? await fetchFileSize(bestAudioUrl) : 0;

    // If couldn't properly fetch the audio file, discard audio
    if (bestAudioFileSize === 0)
        bestAudioUrl = null;

    // Add videos with audio to downloads
    for (const quality of qualities.video) {
        const videoUrl = getDashUrl(quality);
        const videoFileSize = await fetchFileSize(videoUrl);
        if (!videoFileSize)
            continue;
        const downloadInfo = new DownloadInfoVideo(videoUrl, bestAudioUrl, data.filenamePrefix, `${quality}p`, videoFileSize + bestAudioFileSize);
        downloadInfo.postUrl = permalinkToUrl(data.permalink); // Add postUrl, because rapid... 
        downloads.push(downloadInfo)
    }

    // Add all audio qualities to downloads
    for (const quality of qualities.audio) {
        const audioUrl = getDashUrl(quality, true);
        const audioFileSize = audioUrl !== bestAudioUrl ? await fetchFileSize(audioUrl) : bestAudioFileSize;
        if (!audioFileSize)
            continue;
        const downloadInfo = new DownloadInfoAudio(audioUrl, data.filenamePrefix, `${quality}Kbps`, audioFileSize + bestAudioFileSize)
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

async function fetchPostData(postUrl) {
    try {
        const response = await fetch(`${postUrl}.json?raw_json=1`);

        let data = await response.json();
        data = data[0]?.data?.children[0]?.data;

        // If the post is a crosspost, then set get the data from the original post
        const isCrosspost = !!data?.crosspost_parent_list;
        if (isCrosspost)
            data = data.crosspost_parent_list[0]

        data.filenamePrefix = nameFromPermalink(data?.permalink);
        const downloads = [];
        const urlExt = fileExtFromUrl(data.url);

        let method = async () => [];

        if (data?.is_video || data?.preview?.reddit_video_preview?.fallback_url)
            method = getVideoDownloads;
        else if (REDDIT_IMAGE_EXTENSIONS.includes(urlExt))
            method = getImageDownloads;
        else if (data?.is_gallery)
            method = getGalleryDownloads;

        downloads.push(...await method(data))

        const postData = new PostData(postUrl, data?.title, downloads);
        return postData;
    } catch(error) {
        throw error;
    }
}

// TODO: Implement
function generateBtnElementNewUI() {

}

// TODO: Implement
function generateBtnElementOldUI() {

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
    btn.addEventListener("click", e => {
        btn.blur();
        postData.downloads[0].download(e.ctrlKey);
    })

    btnWrapper.append(btn);

    injectContainer.appendChild(btnWrapper)

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

        listElement.addEventListener("click", e => {
            download.download(e.ctrlKey);
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
        const permalink = p.querySelector("a[data-click-id=body]")?.getAttribute("href")
        if (!permalink)
            continue;

        const url = permalinkToUrl(permalink);
        const injectContainer = drawer.lastChild;
        let toDownload = false;
        let toDownloadSaveAs = false;

        const downloadBtnPlaceholderWrapper = document.createElement('div');
        downloadBtnPlaceholderWrapper.classList.add('v-dwnld-download-placeholder-wrapper');

        const downloadBtnPlaceholder = document.createElement('button');
        downloadBtnPlaceholder.classList.add('v-dwnld-download-placeholder');
        downloadBtnPlaceholder.classList.add("YszYBnnIoNY8pZ6UwCivd");
        downloadBtnPlaceholder.addEventListener('click', e => {
            toDownload = true;
            toDownloadSaveAs = e.ctrlKey;
        })

        const downloadBtnPlaceholderIcon = document.createElement('span')
        downloadBtnPlaceholderIcon.textContent = "download";
        downloadBtnPlaceholderIcon.classList.add("material-symbols-outlined");
        downloadBtnPlaceholderIcon.classList.add("v-dwnld-download-placeholder-icon");

        downloadBtnPlaceholder.appendChild(downloadBtnPlaceholderIcon);

        downloadBtnPlaceholderWrapper.appendChild(downloadBtnPlaceholder);
        injectContainer.appendChild(downloadBtnPlaceholderWrapper);


        const handleMouseOver = () => {
            const loadingIcon = document.createElement('span');
            loadingIcon.textContent = "progress_activity";
            loadingIcon.classList.add("material-symbols-outlined");
            loadingIcon.classList.add("v-dwnld-download-loading-icon");

            downloadBtnPlaceholderIcon.remove();
            downloadBtnPlaceholder.appendChild(loadingIcon);
            fetchPostData(url)
                .then(postData => {
                    downloadBtnPlaceholderWrapper.remove();
                    if (!postData || postData.downloads.length === 0)
                        return;
                    handleInjectButton(postData, injectContainer);
                    if (toDownload)
                        postData.downloads[0].download(toDownloadSaveAs);
                })
            downloadBtnPlaceholder.removeEventListener('mouseover', handleMouseOver)
        }
        downloadBtnPlaceholder.addEventListener('mouseover', handleMouseOver)
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

function init() {
    setInterval(_ => {
        checkForChangesAndInject();
    }, REFRESH_INTERVAL_MS);
    checkForChangesAndInject();
}

init();

(async () => {
    const test = (await import(browser.runtime.getURL('test.js'))).test;
    test();
  })();