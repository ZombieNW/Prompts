<script lang="ts">
	import type { ResponseWithMeta } from '$lib/types';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	export let response: ResponseWithMeta;

	const LENGTH_CUTOFF = 50;

	const formatDate = (ts: number) =>
		new Date(ts).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});

	const formatTime = (ts: number) =>
		new Date(ts).toLocaleTimeString('en-GB', {
			hour: '2-digit',
			minute: '2-digit'
		});

	async function handleLike() {
		const res = await fetch(`/responses/${response.id}/like`, { method: 'POST' });
		if (res.ok) {
			const data = await res.json();
			response = { ...response, user_has_liked: data.liked };
		}
	}

	onMount(async () => {
		const res = await fetch(`/responses/${response.id}/like`, { method: 'GET' });
		if (res.ok) {
			const data = await res.json();
			response = { ...response, user_has_liked: data.userHasLiked };
		}
	});
</script>

<div class="relative my-4 rounded-xl bg-stone-900/50 p-4">
	<div class="flex flex-col gap-3">
		<!-- User, Prompt, Time -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="font-medium text-stone-200">{response.username}</span>
				{#if response.published === 0}
					<span class="rounded-full bg-stone-800 px-4 text-stone-500">draft</span>
				{/if}
			</div>
			<a
				href={`/prompts/${response.prompt_id}`}
				class="text-stone-400 transition-colors duration-300 hover:text-stone-300 hover:underline"
			>
				{response.prompt_body.length > LENGTH_CUTOFF
					? response.prompt_body.slice(0, LENGTH_CUTOFF - 3) + '...'
					: response.prompt_body}
			</a>
			<div class="text-stone-500">
				{formatDate(response.created_at)}
				{#if response.updated_at !== response.created_at}
					<span class="text-stone-600 italic">
						(edited {formatTime(response.updated_at)})
					</span>
				{/if}
			</div>
		</div>

		<!-- Actual text -->
		<p class="py-2 leading-relaxed whitespace-pre-wrap text-stone-300">
			{response.body}
		</p>

		<!-- Like Bar -->
		<div class="flex justify-end gap-2">
			<button
				type="button"
				class="group flex items-center gap-1.5 transition-colors {response.user_has_liked
					? 'text-rose-400'
					: 'text-stone-500 hover:text-rose-400'}"
				aria-label={response.user_has_liked ? 'Unlike' : 'Like'}
				on:click={handleLike}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 transition-transform group-active:scale-90"
					viewBox="0 0 20 20"
					fill={response.user_has_liked ? 'currentColor' : 'none'}
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path
						d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
					/>
				</svg>
				<span class="font-medium text-stone-500!">{response.like_count}</span>
			</button>
		</div>
	</div>
	<hr class="my-4 border-stone-700" />
</div>
