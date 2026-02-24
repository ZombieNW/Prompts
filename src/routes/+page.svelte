<script lang="ts">
	import Responsearea from '$lib/components/responsearea.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>Prompts, not Prompts</title>
</svelte:head>

<div class="flex h-screen flex-col items-center justify-center">
	<p class="font-medium text-stone-400">write about...</p>
	<h1 class="text-6xl font-bold">{data.prompt.body}</h1>
	{#if data.user}
		{#if data.user.verified === 1}
			<Responsearea
				placeholder="write anything you're thinking about"
				id="response"
				name="response"
			/>
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
