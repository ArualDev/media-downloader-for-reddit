<script lang="ts">
    import type DownloadData from "../../types/DownloadData";

    export let text = '';
    export let downloads: DownloadData[] = [];
    export let onClick: (e: MouseEvent) => void;
</script>

<li>
    <a on:click={onClick} href="#download">{text}</a>
</li>