<script lang="ts">
    import type { BaseDownloadable } from "../../lib/downloadable/BaseDownloadable";
    import DownloadScreen from "../common/DownloadScreen.svelte";

    export let text = "";
    export let downloads: BaseDownloadable[] = [];
    export let onClickMain: (e: MouseEvent) => void;
    export let onClickMore: (e: MouseEvent) => void;
</script>

<li>
    <a on:click={onClickMain} href="#download">{text}</a>
    <a on:click={onClickMore} class="mdfr-more" href="#uwu">
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
    </a>
</li>

<!-- <DownloadScreen bind:this={downloadScreen} {downloads}></DownloadScreen> -->

<style>
    .mdfr-more svg {
        transform: translate(-4px, 4px);
    }
</style>
