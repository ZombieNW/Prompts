<script lang="ts">
	import type { PromptWithMeta } from '$lib/types';
	export let prompt: PromptWithMeta;

	function formatTimestampToLongDate(timestamp: number): string {
		const date = new Date(timestamp);

		if (isNaN(date.getTime())) {
			throw new Error('Invalid timestamp provided');
		}

		const options: Intl.DateTimeFormatOptions = {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		};

		const formatted = new Intl.DateTimeFormat('en-GB', options).format(date);
		return formatted.replace(/( \d{4})$/, ', $1');
	}
</script>

<div class="my-4 rounded-xl bg-stone-900/50 p-4">
	<div class="flex flex-row justify-between">
		<div class="flex flex-col">
			<p class="text-stone-400">{formatTimestampToLongDate(prompt.created_at)}</p>
			<p class="my-2 text-stone-400">"<span class="text-stone-300">{prompt.body}</span>"</p>
		</div>
	</div>

	<div class="flex flex-row justify-end">
		<p>{prompt.response_count} responses</p>
		{#if prompt.source !== 'admin'}
			<p class="pl-4 text-stone-400">{prompt.created_by}</p>
		{/if}
	</div>

	<hr class="my-4 border-stone-700" />
</div>
