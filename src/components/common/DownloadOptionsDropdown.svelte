<script lang="ts">
    import type DownloadData from "../../types/DownloadData";

    export let downloads: DownloadData[] = [];
    export let active: Boolean = false;


    function handleDownloadClick(download: DownloadData) {
        download.download();
    }

</script>

{#if active}
    <ul>
        {#each downloads as download, i}
            <li>
                <a on:click={e => handleDownloadClick(download)} href="#download-{i}">Download</a>
            </li>
        {/each}
    </ul>
{/if}

<style>
    ul {
        position: absolute;
        margin: 0;
        right: 0;
        z-index: 900;
        max-height: 300px;
        background-color: #222;
        color: #ddd;
        list-style-type: none;
    }
</style>
