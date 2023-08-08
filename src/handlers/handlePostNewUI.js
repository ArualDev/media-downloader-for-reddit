import { permalinkToUrl } from "../helpers/utils";
import handleInjectButton from "./handleInjectButton";

export default function handlePostNewUI() {
    const postContent = document.querySelector('shreddit-post');
    if (!postContent)
        return;

    if (postContent.getAttribute("mdfr-checked"))
        return;
    postContent.setAttribute("mdfr-checked", true)

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