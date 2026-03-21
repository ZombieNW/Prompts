<script>
	import Response from '$lib/components/ResponseBox.svelte';
	import PromptBox from '$lib/components/PromptBox.svelte';

	let { data } = $props();
</script>

<div class="mx-auto mt-26 flex w-2/3 flex-col text-stone-400">
	<h1 class="text-2xl text-stone-300">Responses</h1>
	<hr class="mb-6 border-stone-700" />

	<h1>Today's Prompt</h1>
	<PromptBox prompt={data.todaysPrompt} />
	<hr class="mb-6 border-stone-700" />

	{#if data.userResponse === null}
		<p>
			<a href="/" class="transition-colors duration-300 hover:text-stone-300"
				>Submit your own response</a
			> before viewing other's responses.
		</p>
		<hr class="mb-6 border-stone-700" />
	{:else}
		<h1>Your Response</h1>
		<Response response={data.userResponse} />
		<hr class="mb-6 border-stone-700" />

		<h1>Public Responses</h1>
		<ul class="mb-6">
			{#each data.responses as response}
				{#if response.id !== data.userResponse.id}
					<li><Response {response} /></li>
				{/if}
			{/each}
		</ul>
		<hr class="mb-6 border-stone-700" />
	{/if}
</div>
