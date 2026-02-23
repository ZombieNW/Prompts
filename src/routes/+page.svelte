<script>
	import Responsearea from '$lib/components/responsearea.svelte';
	let { data } = $props();
</script>

<div class="flex h-screen flex-col items-center justify-center">
	<p class="font-medium text-stone-400">write about...</p>
	<h1 class="text-6xl font-bold">a text message you'll never receive</h1>
	{#if data.user}
		<Responsearea
			placeholder="write anything you're thinking about"
			id="response"
			name="response"
		/>
	{:else}
		<div class="my-4 text-stone-400">
			<a
				href="/login"
				class="text-stone-300 transition-colors duration-300 hover:text-stone-400 hover:underline"
				>login</a
			>
			<span>or</span>
			<a
				href="/register"
				class="text-stone-300 transition-colors duration-300 hover:text-stone-400 hover:underline"
				>register</a
			>
			<span>to respond</span>
		</div>
	{/if}
</div>
