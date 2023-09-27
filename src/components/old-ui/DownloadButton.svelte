<script lang="ts">
    import type DownloadData from "../../types/DownloadData";
    import DownloadScreen from "../common/DownloadScreen.svelte";

    export let text = '';
    export let downloads: DownloadData[] = [];
    export let onClick: (e: MouseEvent) => void;

    let downloadScreen: DownloadScreen;
</script>

<li>
    <a on:click={onClick} href="#download">{text}</a>
    <a on:click={() => downloadScreen.toggle()} class="mdfr-more" href="#uwu">

        <svg
        class="mdfr-download-main-svg"
        xmlns="http://www.w3.org/2000/svg"
        height="16"
        fill="currentColor"
        viewBox="0 -960 960 960"
        width="16"
    >
    <path xmlns="http://www.w3.org/2000/svg" d="M480-336 239-576h482L480-336Z"/>
    </svg>

    </a>
</li>

<DownloadScreen bind:this={downloadScreen} downloads={downloads}></DownloadScreen>

<style>
    .mdfr-more svg {
        transform: translate(-4px, 4px);
    }
</style>