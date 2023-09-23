<script lang="ts">
    import type DownloadData from "../../types/DownloadData";

    export let text = "";
    export let downloads: DownloadData[] = [];
    export let onClick: (e: MouseEvent) => void;
</script>

<!-- _JRBNstMcGxbZUxrrIKXe  _1pShbCnOaF7EGWTq6IvZux _28vEaVlLWeas1CDiLuTCap-->
<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
/>
<div class=" _3U_7i38RDPV5eBv7m4M-9J _3yh2bniLq7bYr4BaiXowdO">
    <button on:click={onClick} class="kU8ebCMnbXfjCWfqn0WPb">
        <span class="flex text-16 mr-[length:var(--rem6)]">
            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="26" viewBox="0 -960 960 960" width="26">
                <path d="M480-336.923 338.461-478.462l28.308-28.769L460-414v-346h40v346l93.231-93.231 28.308 28.769L480-336.923ZM264.615-200Q237-200 218.5-218.5 200-237 200-264.615v-96.923h40v96.923q0 9.23 7.692 16.923Q255.385-240 264.615-240h430.77q9.23 0 16.923-7.692Q720-255.385 720-264.615v-96.923h40v96.923Q760-237 741.5-218.5 723-200 695.385-200h-430.77Z"/>
            </svg>
            <!-- <span class="material-symbols-outlined"> download </span> -->
        </span>
        <span class="_6_44iTtZoeY6_XChKt5b0">{text}</span>
    </button>
</div>

<style>

    svg {
        display: inline;
        /* font-size: 30px; */
    }

    /* .material-symbols-outlined {
        font-variation-settings: "FILL" 0, "wght" 200, "GRAD" 0, "opsz" 24;
        font-size: 30px;
    } */
</style>
