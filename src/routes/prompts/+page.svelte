<script>
	import PromptBox from '$lib/components/PromptBox.svelte';

	let { data } = $props();
</script>

<div class="mx-auto mt-26 flex w-2/3 flex-col text-stone-400">
	<h1>Prompts</h1>
	<hr class="mb-6 border-stone-700" />

	<h1>Today's Prompt</h1>
	<PromptBox prompt={data.todaysPrompt} />
	<h1>Previous Prompts</h1>
	<ul class="mb-6">
		{#each data.prompts as prompt}
			<li><PromptBox {prompt} /></li>
		{/each}
	</ul>
</div>
