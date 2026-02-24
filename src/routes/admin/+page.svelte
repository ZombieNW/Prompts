<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import AdminPrompt from '$lib/components/admin/AdminPrompt.svelte';

	let { data } = $props();

	let promptBodyValue = $state<string>('');

	async function addPrompt() {
		const formData = new FormData();
		formData.append('body', promptBodyValue);

		try {
			const response = await fetch('?/createPrompt', {
				method: 'POST',
				body: formData // No JSON.stringify needed!
			});

			const result = await response.json();

			if (result.type === 'success') {
				promptBodyValue = '';
				invalidateAll();
			} else {
				alert('Error: ' + result.error.message);
			}
		} catch (err) {
			console.error('Request failed', err);
		}
	}
</script>

<div class="mx-auto mt-26 flex w-2/3 flex-col">
	<h1>Welcome, {data.user.username}</h1>
	<hr class="mb-6 border-stone-700" />

	<h2>Today's Prompt</h2>
	<p class="mb-6 text-stone-400">"{data.prompt.body}"</p>

	<h2>Prompt Pool</h2>
	<ul class="mb-6 list-disc">
		{#each data.prompts as prompt}
			<li><AdminPrompt {prompt} /></li>
		{/each}
		{#if data.prompts.length === 0}
			<p class="text-stone-400">No Prompts Right Now</p>
		{/if}
	</ul>

	<h2>Add Prompt</h2>
	<div
		class="relative my-4 min-h-1/6 w-full rounded-xl border-2 border-stone-800 text-stone-200 transition-colors duration-300 outline-none focus-within:border-stone-700"
	>
		<textarea class="h-full w-full resize-none p-4 outline-none" bind:value={promptBodyValue}
		></textarea>

		<div class="absolute right-2 bottom-2">
			<button
				class="w-28 rounded-xl bg-stone-700 py-2 text-white outline-2 outline-stone-800 transition-colors duration-300 hover:cursor-pointer hover:bg-stone-800"
				onclick={addPrompt}
			>
				Send
			</button>
		</div>
	</div>
</div>
