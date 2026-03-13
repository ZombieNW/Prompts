<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/header.svelte';

	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: () => any } = $props();
</script>

<Header {data} />

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Prompts, Not Prompts</title>
</svelte:head>

{@render children()}

<Footer />
