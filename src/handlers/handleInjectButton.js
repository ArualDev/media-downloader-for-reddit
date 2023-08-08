import { formatFileSize } from "../helpers/utils";

// TODO: Refactor this
export default function handleInjectButton(postData, injectContainer) {
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