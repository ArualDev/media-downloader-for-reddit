import handlePostNewUI from "./handlePostNewUI";
import handleInjectButton from "./handleInjectButton";
import fetchPostData from "../helpers/fetchPostData";

export default function handlePost() {
    const postContent = document.querySelector('[data-test-id="post-content"]');
    if (!postContent) {
        handlePostNewUI();
        return;
    }

    if (postContent.getAttribute("mdfr-checked"))
        return;
    postContent.setAttribute("mdfr-checked", true)

    const url = postContent.baseURI;
    const drawer = postContent.querySelector("._3-miAEojrCvx_4FQ8x3P-s");

    fetchPostData(url)
        .then(postData => {
            if (!postData || postData.downloads.length === 0)
                return;
            handleInjectButton(postData, drawer.lastChild)
        })
}