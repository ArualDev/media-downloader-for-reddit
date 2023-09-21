<script lang="ts">
    export let text = '';
    export let onClick: (e: MouseEvent) => void;
</script>

<li>
    <a on:click={onClick} href="#download">{text}</a>
</li>