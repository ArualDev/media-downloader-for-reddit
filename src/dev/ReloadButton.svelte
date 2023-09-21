<script lang="ts">
    export let onCLick: () => void;
</script>

<button on:click={onCLick}>
    <svg xmlns="http://www.w3.org/2000/svg" color="white" height="32" viewBox="0 -960 960 960" width="32"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
</button>

<style>
    button {
        position: fixed;
        z-index: 999;
        top: 0;
        cursor: pointer;
        font-size: 51px;
        border-radius: 50%;
        padding: 20px;
        border: none;
        background-color: #5BCEFA;
        opacity: 0.7;
        margin-top: 10px;
        margin-left: 10px;
        backdrop-filter: blur(10px);
    }

    button:hover{
        opacity: 1;
    }

    svg {
        display: block;
        fill: white;
    }

</style>
