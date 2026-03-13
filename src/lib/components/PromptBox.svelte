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

<div class="my-4 rounded-xl border-2 border-stone-700 p-4">
	<div class="flex flex-row-reverse justify-between">
		<p class="text-stone-400">{formatTimestampToLongDate(prompt.created_at)}</p>
		{#if prompt.source !== 'admin'}
			<p class="text-stone-400">{prompt.created_by}</p>
		{/if}
	</div>
	<p class="my-4 text-stone-300">{prompt.body}</p>
</div>
