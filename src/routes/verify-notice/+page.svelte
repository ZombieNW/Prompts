<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	let sent = false;
	let error = '';
	let loading = false;

	async function resend() {
		error = '';
		loading = true;
		try {
			const res = await fetch('/resend-verification', { method: 'POST' });
			const json = await res.json();
			if (!res.ok) error = json.error ?? 'Failed';
			else sent = true;
		} finally {
			loading = false;
		}
	}
</script>

<h1>Verify your email</h1>
<p>We sent a link to <strong>{data.user?.email}</strong>. Click it to activate your account.</p>
{#if sent}<p>Resent! Check your inbox.</p>{/if}
{#if error}<p>{error}</p>{/if}
<button on:click={resend} disabled={loading || sent}>
	{loading ? 'Sending…' : 'Resend email'}
</button>
