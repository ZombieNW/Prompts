<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { Prompt } from '$lib/types';

	export let prompt: Prompt;

	function deletePrompt() {
		const formData = new FormData();
		formData.append('id', prompt.id.toString());

		fetch(`?/deletePrompt`, {
			method: 'POST',
			body: formData
		});

		invalidateAll();
	}
</script>

<div class="flex gap-4">
	<p class="text-stone-400">{prompt.body}</p>
	<button class="text-rose-300 hover:cursor-pointer" on:click={deletePrompt}>delete</button>
</div>
