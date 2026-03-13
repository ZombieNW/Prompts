<script>
	import Response from '$lib/components/Response.svelte';

	let { data } = $props();
</script>

<div class="mx-auto mt-26 flex w-2/3 flex-col text-stone-400">
	<div class="flex justify-between">
		<h1 class="text-2xl text-stone-300">{data.user.username}</h1>
	</div>
	<hr class="mb-6 border-stone-700" />

	<h2>Responses</h2>
	<ul class="mb-6">
		{#each data.userResponses as response}
			<li><Response {response} /></li>
		{/each}
	</ul>
</div>
