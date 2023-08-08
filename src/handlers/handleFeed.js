import fetchPostData from "../helpers/fetchPostData";
import handleInjectButton from "./handleInjectButton";
import { permalinkToUrl } from "../helpers/utils";

export default function handleFeed() {
    const feedPostContainer = document.querySelector('.rpBJOHq2PR60pnwJlUyP0')
        ?? document.querySelector('[data-scroller-first=""]')?.parentNode;
    if (!feedPostContainer)
        return;

    const posts = document.querySelectorAll('.scrollerItem, [data-testid="post-container"]');

    for (const p of posts) {
        if (p.getAttribute("mdfr-checked"))
            continue;
        p.setAttribute("mdfr-checked", true)

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