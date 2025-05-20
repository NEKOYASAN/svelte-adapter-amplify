<script lang="ts">
import type { PageProps } from './$types';

let { data }: PageProps = $props();
</script>


<div>
    {#await data.data}
        <p>Loading...</p>
    {:then value}
        <p>{JSON.stringify(value)}</p>
    {:catch error}
        <p>Error: {error.message}</p>
    {/await}
</div>