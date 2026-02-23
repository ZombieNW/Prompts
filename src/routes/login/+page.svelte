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

<h1>Login</h1>
{#if error}<p>{error}</p>{/if}
<input bind:value={email} type="email" placeholder="Email" />
<input bind:value={password} type="password" placeholder="Password" />
<button on:click={login} disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
<p><a href="/register">Create an account</a></p>
