<!-- I was bored, okay? -->

<script lang="ts">
    export let onClick: () => void;
    let button: HTMLButtonElement | null = null;
    let mask: HTMLDivElement | null = null;
    let clicked = false;
    
    function handleClick() {
        onClick();
        clicked = true;
    }

    $: {
        if (clicked) {
            button?.classList.add("clicked");
        } else {
            button?.classList.remove("clicked");
        }
    }
</script>

<button class="clicked" on:click={handleClick} bind:this={button} title="Reload extension &#013;Media Downloader for Reddit">
    <svg
        xmlns="http://www.w3.org/2000/svg"
        color="white"
        height="32"
        viewBox="0 -960 960 960"
        width="32"
        ><path
            d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"
        /></svg
    >
</button>

{#if clicked}
    <div id="mask" bind:this={mask} />
{/if}

<style>
    @keyframes rotation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    button {
        position: fixed;
        z-index: 999;
        top: 0;
        cursor: pointer;
        font-size: 51px;
        border-radius: 50%;
        padding: 20px;
        border: none;
        background-color: #5bcefa;
        opacity: 0.7;
        margin-top: 10px;
        margin-left: 10px;
        backdrop-filter: blur(10px);
        transition: opacity 0.2s, scale 0.2s;
    }

    button:hover {
        opacity: 1;
        scale: 1.1;
    }

    button.clicked {
        animation: rotation 0.7s infinite linear;
        opacity: 1;
        scale: 3;
    }

    button.clicked:hover {
        scale: 3;
    }

    svg {
        display: block;
        fill: white;
    }

    #mask {
        background-color: black;
        opacity: 0.3;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 998;
        backdrop-filter: blur(10px);
    }
</style>
