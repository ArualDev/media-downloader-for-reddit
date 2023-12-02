<script lang="ts">
    import type { BaseDownloadable } from "../../lib/download-data/BaseDownloadable";
    import DownloadScreen from "../common/DownloadScreen.svelte";

    export let text = "";
    export let downloads: BaseDownloadable[] = [];
    export let onClickMain: (e: MouseEvent) => void;
    export let onClickMore: (e: MouseEvent) => void;

    let downloadScreen: DownloadScreen;

    let dropdownActive = false;

    function handleClickMoreBtn(e: MouseEvent) {
        onClickMore(e);
    }
</script>

<button
    on:click={onClickMain}
    class={"button border-md flex flex-row justify-center items-center h-xl font-semibold relative text-12" +
        " button-secondary inline-flex items-center px-sm hover:text-secondary hover:bg-secondary-background-hover" +
        " hover:border-secondary-background-hover" +
        " mdfr-download-main-btn"}
>
    <span class="flex items-center">
        <span class="flex text-16 mr-[length:var(--rem6)]">
            <svg
                class="mdfr-download-main-svg"
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                fill="currentColor"
                viewBox="80 -880 800 800"
                width="20"
            >
                <path
                    xmlns="http://www.w3.org/2000/svg"
                    d="M480-323.385 314.31-489.076l32.614-32.23 110.384 110v-368.693h45.384v368.693l110.384-110 32.614 32.23L480-323.385ZM237.694-180.001q-23.529 0-40.611-17.082-17.082-17.082-17.082-40.611V-363h45.384v125.306q0 4.616 3.846 8.463 3.847 3.846 8.463 3.846h484.612q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463V-363h45.384v125.306q0 23.529-17.082 40.611-17.082 17.082-40.611 17.082H237.694Z"
                />
            </svg>
        </span>
        Download
    </span>
</button>

<button
    on:click={handleClickMoreBtn}
    class={"button border-md flex flex-row justify-center items-center h-xl font-semibold relative text-12" +
        " button-secondary inline-flex items-center px-sm hover:text-secondary hover:bg-secondary-background-hover" +
        " hover:border-secondary-background-hover" +
        " mdfr-download-more-btn"}
>
    <svg
        class="mdfr-download-main-svg"
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        fill="currentColor"
        viewBox="0 -960 960 960"
        width="16"
    >
        <path
            xmlns="http://www.w3.org/2000/svg"
            d="M480-336 239-576h482L480-336Z"
        />
    </svg>
</button>

<!-- <DownloadOptionsDropdown downloads={downloads} active={dropdownActive}></DownloadOptionsDropdown> -->
<DownloadScreen bind:this={downloadScreen} {downloads}></DownloadScreen>

<style>
    .mdfr-download-main-btn {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        padding-right: 4px;
    }

    .mdfr-download-more-btn {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        padding-left: 4px;
        padding-right: 6px;
    }

    .mdfr-download-main-svg {
        /* scale: 1.2; */
    }

    .mdfr-btn-container {
        position: relative;
        height: fit-content;
    }
</style>
