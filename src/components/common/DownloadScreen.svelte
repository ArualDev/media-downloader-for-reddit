<script lang="ts">
    import type { BaseDownloadable } from "../../lib/download-data/BaseDownloadData";

    // import type DownloadData from "../../lib/download-data/DownloadData";
    import { formatFileSize } from "../../lib/utils";

    export let downloads: BaseDownloadable[] = [];
    let active = false;

    export function toggle() {
        active = !active;
    }

    export function updateDownloads(newDownloads: BaseDownloadable[]) {
        downloads = newDownloads;
    }

    let mask: HTMLElement;
    let container: HTMLElement;

    function handleMaskClick(e: MouseEvent) {
        if (container.contains(e.target as HTMLElement)) return;
        active = false;
    }

    function handleDownloadClick(download: BaseDownloadable) {
        download.download();
    }

    $: {
        if (active) {
            mask?.classList.add("active");
        } else {
            mask?.classList.remove("active");
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="mask" bind:this={mask} on:click={handleMaskClick}>
    <section bind:this={container}>
        <ul>
            {#each downloads as download}
                <li>
                    <button on:click={() => handleDownloadClick(download)}>
                        Download {download.downloadTypeName}
                        {download.qualityString ?? " "}
                        {download.fileSize
                            ? formatFileSize(download.fileSize)
                            : "?"}
                    </button>
                </li>
            {/each}
        </ul>
    </section>
</div>

<style>
    .mask {
        position: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 90;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        cursor: auto;
        top: 0;
        left: 0;
        backdrop-filter: blur(2px);
    }

    .mask:not(.active) {
        display: none;
    }

    section {
        min-width: 50%;
        min-height: 50%;
        background-color: #222;
        color: #ccc;
        cursor: auto;
    }

    ul {
        list-style: none;
    }
</style>
