<script>
	import PromptBox from '$lib/components/PromptBox.svelte';

	let { data } = $props();
</script>

<div class="mx-auto my-26 flex w-2/3 flex-col text-stone-400">
	<h1 class="text-2xl text-stone-300">Prompts</h1>
	<hr class="mb-6 border-stone-700" />

	<h1>Today's Prompt</h1>
	<PromptBox prompt={data.todaysPrompt} />
	<h1>Previous Prompts</h1>
	{#each data.prompts as prompt}
		<PromptBox {prompt} />
	{/each}

	<hr class="mb-6 border-stone-700" />

	<div class="my-8 flex items-center justify-between">
		{#if data.offset > 0}
			<a
				href="?offset={Math.max(0, data.offset - data.limit)}"
				class="w-12 transition-colors hover:text-stone-200"
			>
				{'<---'}
			</a>
		{:else}
			<div class="w-12"></div>
		{/if}

		<span class="text-sm italic">
			{(data.offset % data.limit) + 1 + data.offset}
			-
			{(data.offset % data.limit) + data.limit + data.offset}
		</span>

		{#if data.prompts.length === data.limit}
			<a
				href="?offset={data.offset + data.limit}"
				class="w-12 transition-colors hover:text-stone-200"
			>
				{'--->'}
			</a>
		{:else}
			<div class="w-12"></div>
		{/if}
	</div>
</div>
