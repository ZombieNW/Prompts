<script>
	import Response from '$lib/components/Response.svelte';
	let { data } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center">
	<Response response={data.response} />
</div>
