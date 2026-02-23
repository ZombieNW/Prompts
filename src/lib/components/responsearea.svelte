<script lang="ts">
	export let value: string = '';
	export let placeholder: string = '';
	export let id: string = '';
	export let name: string = '';
</script>

<div
	class="relative mt-12 min-h-1/6 w-full rounded-xl border-2 border-stone-800 text-stone-200 transition-colors duration-300 outline-none focus-within:border-stone-700 md:w-1/2"
>
	<textarea bind:value class="h-full w-full resize-none p-4 outline-none" {placeholder} {id} {name}
	></textarea>

	<div class="absolute right-2 bottom-2">
		<button
			class="w-28 rounded-xl bg-stone-700 py-2 text-white outline-2 outline-stone-800 transition-colors duration-300 hover:cursor-pointer hover:bg-stone-800"
		>
			Send
		</button>
	</div>
</div>
