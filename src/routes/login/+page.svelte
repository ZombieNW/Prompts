<script lang="ts">
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function login() {
		error = '';
		loading = true;
		try {
			const res = await fetch('/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error ?? 'Login failed';
				return;
			}
			goto('/', { invalidateAll: true });
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>login | Prompts, Not Prompts</title>
</svelte:head>

<div class="flex h-screen flex-col items-center justify-center">
	<div
		class="flex w-1/4 flex-col items-center justify-center rounded-xl border-2 border-stone-700 p-4"
	>
		<h1 class="text-2xl font-semibold">login</h1>

		{#if error}
			<p class="mt-3 w-full rounded-xl border-2 border-rose-900 bg-rose-950 p-2 text-rose-100">
				{error}
			</p>
		{/if}

		<input bind:value={email} type="email" placeholder="email" />
		<input bind:value={password} type="password" placeholder="password" />
		<button on:click={login} disabled={loading}>{loading ? 'logging in...' : 'login'}</button>
		<p><a href="/register">create an account</a></p>
	</div>
</div>

<style>
	@reference "tailwindcss";
	input {
		@apply my-3 w-full border-b-2 border-stone-800 bg-transparent p-2 outline-none;
	}

	button {
		@apply my-3 w-full rounded-xl bg-stone-700 py-2 text-white outline-2 outline-stone-800 transition-colors duration-300 hover:cursor-pointer hover:bg-stone-800;
	}
</style>
