<script lang="ts">
	import type { ResponseWithMeta } from '$lib/types';
	export let response: ResponseWithMeta;

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
		return formatted.replace(/(\d{4})$/, ', $1');
	}
</script>

<div class="my-4 rounded-xl border-2 border-stone-700 p-4">
	<div class="flex justify-between">
		<p class="text-stone-400">Post by @{response.username}</p>
		<p>"<span class="text-stone-300">{response.prompt_body}</span>"</p>
		<p class="text-stone-400">{formatTimestampToLongDate(response.created_at)}</p>
	</div>
	<p class="my-4 text-stone-300">{response.body}</p>
</div>
