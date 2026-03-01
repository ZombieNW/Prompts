<script>
	import Response from '$lib/components/Response.svelte';

	let { data } = $props();
</script>

<div class="mx-auto mt-26 flex w-2/3 flex-col text-stone-400">
	<h1>Today's Responses</h1>
	<hr class="mb-6 border-stone-700" />

	{#if data.userResponse === null}
		<p>
			<a href="/" class="transition-colors duration-300 hover:text-stone-300"
				>Submit your own response</a
			> before viewing other's responses.
		</p>
	{:else}
		<h1>Your Response</h1>
		<Response response={data.userResponse} />
		<h1>Public Responses</h1>
		<ul class="mb-6">
			{#each data.responses as response}
				<li><Response {response} /></li>
			{/each}
		</ul>
	{/if}
</div>
