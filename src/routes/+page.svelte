<script lang="ts">
	import Responsearea from '$lib/components/ResponseArea.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>Prompts, not Prompts</title>
</svelte:head>

<div class="flex h-screen w-full flex-col items-center justify-center px-4">
	{#if data.userResponse === null}
		<p class="font-medium text-stone-400">write about...</p>
	{:else}
		<p class="font-medium text-stone-400">today's prompt</p>
	{/if}
	<a href="/prompts" class="text-6xl font-bold transition-colors duration-300 hover:text-stone-400"
		>{data.prompt.body}</a
	>
	{#if data.user}
		{#if data.user.verified === 1 && data.userResponse === null}
			<Responsearea id="response" name="response" />
		{:else if data.user.verified === 1 && data.userResponse !== null}
			<a
				href={`/prompts/${data.prompt.id}`}
				class="my-4 text-stone-300 transition-colors duration-300 hover:text-stone-400 hover:underline"
			>
				view responses
			</a>
		{:else}
			<a
				href="/verify"
				class="my-4 text-stone-300 transition-colors duration-300 hover:text-stone-400 hover:underline"
			>
				verify your email to respond
			</a>
		{/if}
	{:else}
		<div class="my-4 text-stone-400">
			<a
				href="/login"
				class="text-stone-300 transition-colors duration-300 hover:text-stone-400 hover:underline"
				>login
			</a>
			<span>or</span>
			<a
				href="/register"
				class="text-stone-300 transition-colors duration-300 hover:text-stone-400 hover:underline"
				>register
			</a>
			<span>to respond</span>
		</div>
	{/if}
</div>
