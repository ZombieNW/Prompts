<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	export let value: string = '';
	export let id: string = '';
	export let name: string = '';

	const wittyLines = [
		"write anything you're talking about",
		'how does this make you feel?',
		"what's on your mind?",
		"it's okay, no one's going to grade it",
		'just start typing',
		'even one little sentence is enough',
		'no wrong answers',
		'just start typing',
		'this box has no judgement',
		'put the inside thought here',
		'write something real',
		'thoughts over content',
		'just write',
		'say the quiet thought',
		'start anywhere',
		'write before you overthink it'
	];

	export let placeholder: string = wittyLines[Math.floor(Math.random() * wittyLines.length)];

	function handleSubmit() {
		if (value.length > 0) {
			const formData = new FormData();
			formData.append('body', value);

			fetch('?/createResponse', {
				method: 'POST',
				body: formData
			});

			value = '';
			invalidateAll();
		}
	}
</script>

<div
	class="relative mt-12 min-h-1/6 w-full rounded-xl border-2 border-stone-800 text-stone-200 transition-colors duration-300 outline-none focus-within:border-stone-700 md:w-1/2"
>
	<textarea bind:value class="h-full w-full resize-none p-4 outline-none" {placeholder} {id} {name}
	></textarea>

	<div class="absolute right-2 bottom-2">
		<button
			on:click={handleSubmit}
			class="w-28 rounded-xl bg-stone-700 py-2 text-white outline-2 outline-stone-800 transition-colors duration-300 hover:cursor-pointer hover:bg-stone-800"
		>
			Send
		</button>
	</div>
</div>
