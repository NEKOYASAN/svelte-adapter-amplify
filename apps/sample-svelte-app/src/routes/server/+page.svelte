<script lang="ts">
import type { PageProps } from './$types';

let { data }: PageProps = $props();
</script>


<div>
    {JSON.stringify(data.data)}
</div>