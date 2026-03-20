<script>
	import PromptBox from '$lib/components/PromptBox.svelte';
	import ResponseBox from '$lib/components/ResponseBox.svelte';
	let { data } = $props();
</script>

<div class="mx-auto my-26 flex w-2/3 flex-col text-stone-400">
	<PromptBox prompt={data.prompt} />
	<hr class="mb-6 border-stone-700" />

	<h1>Responses</h1>
	{#each data.responses as response}
		<ResponseBox {response} />
	{/each}
</div>
