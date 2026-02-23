<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;

	let loading: boolean = false;
	let success: boolean = false;
	let errorMessage: string = '';
</script>

<svelte:head>
	<title>verify email</title>
</svelte:head>

<div class="flex h-screen flex-col items-center justify-center text-center">
	<div class="flex w-1/4 flex-col rounded-xl border-2 border-stone-700 p-4 text-center">
		{#if data.user?.verified === 1}
			<h1 class="text-xl font-semibold">email already verified</h1>
			<p class="mt-2 text-stone-400">no issues here</p>

			<a href="/" class="btn block">go home</a>
		{:else}
			<h1 class="mb-2 text-xl font-semibold">verify your email</h1>

			{#if data.error || errorMessage}
				<p class="my-3 w-full rounded-xl border-2 border-rose-900 bg-rose-950 p-2 text-rose-100">
					{data.error || errorMessage}
				</p>
			{/if}

			{#if success || data.success}
				<p
					class="my-3 w-full rounded-xl border-2 border-emerald-900 bg-emerald-950 p-2 text-emerald-100"
				>
					success! a new link is on its way.
				</p>
			{/if}

			<p class="mb-2 text-stone-400">
				a verification link was sent to
				<strong class="text-stone-300">{data.user?.email}</strong>.
			</p>

			<p class="mt-2 text-stone-400 italic">no such thing?</p>

			<form
				method="POST"
				action="?/resend"
				use:enhance={() => {
					loading = true;
					errorMessage = '';
					success = false;

					return async ({ result }) => {
						loading = false;

						if (result.type === 'success') {
							success = true;
						}

						if (result.type === 'failure') {
							errorMessage = (result.data?.message as string) ?? 'Failed to resend email';
						}
					};
				}}
			>
				<button class="btn" disabled={loading || success}>
					{loading ? 'sending...' : 'resend verification email'}
				</button>
			</form>
		{/if}
	</div>
</div>

<style>
	@reference "tailwindcss";

	.btn {
		@apply my-3 w-full rounded-xl bg-stone-700 py-2 text-white outline-2 outline-stone-800 transition-colors duration-300 hover:cursor-pointer hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50;
	}
</style>
