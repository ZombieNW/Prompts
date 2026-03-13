<script>
	import PromptBox from '$lib/components/PromptBox.svelte';
	let { data } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center">
	<PromptBox prompt={data.prompt} />
</div>
