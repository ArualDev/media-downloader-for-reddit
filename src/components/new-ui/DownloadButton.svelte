<script lang="ts">
    export let text = '';
    export let onClick: (e: MouseEvent) => void;
</script>

<button on:click={onClick}
    class={"button border-md flex flex-row justify-center items-center mr-sm h-xl font-semibold relative text-12" +
        " button-secondary inline-flex items-center px-sm hover:text-secondary hover:bg-secondary-background-hover" +
        " hover:border-secondary-background-hover"}
>
    <span class="flex items-center">
        <span class="flex text-16 mr-[length:var(--rem6)]">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                fill="currentColor"
                viewBox="0 -960 960 960"
                width="24"
            >
                <path
                    xmlns="http://www.w3.org/2000/svg"
                    d="M480-352.923 346.461-486.462l23.308-21.769L464-414v-362h32v362l94.231-94.231 23.308 21.769L480-352.923ZM288.332-232Q264-232 248-248.15t-16-40.465v-48.923h32v48.923q0 9.23 7.692 16.923Q279.385-264 288.615-264h382.77q9.23 0 16.923-7.692Q696-279.385 696-288.615v-48.923h32v48.923q0 24.315-16.162 40.465Q695.676-232 671.344-232H288.332Z"
                />
            </svg>
        </span>
        {text}
    </span>
</button>
