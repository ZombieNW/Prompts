<script lang="ts">
	import { goto } from '$app/navigation';

	let email = '';
	let username = '';
	let password = '';
	let error = '';
	let loading = false;

	async function register() {
		error = '';
		loading = true;
		try {
			const res = await fetch('/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, username, password })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error ?? 'Registration failed';
				return;
			}
			goto('/', { invalidateAll: true });
		} finally {
			loading = false;
		}
	}
</script>

<h1>Register</h1>
{#if error}<p>{error}</p>{/if}
<input bind:value={email} type="email" placeholder="Email" />
<input bind:value={username} placeholder="Username" />
<input bind:value={password} type="password" placeholder="Password" />
<button on:click={register} disabled={loading}>{loading ? 'Registering…' : 'Register'}</button>
<p><a href="/login">Already have an account?</a></p>
