<script>
	export let data;
</script>

<div class="absolute top-4 flex w-full items-center justify-between px-6 py-1 text-stone-400">
	<a href="/">Prompts, Not Prompts</a>
	<div class="flex gap-6">
		<a
			href="/responses"
			class="transition-colors duration-300 hover:text-stone-200 hover:underline"
		>
			responses
		</a>
		<a href="/history" class="transition-colors duration-300 hover:text-stone-200 hover:underline">
			history
		</a>
		<a
			href={data.user ? '/profile' : '/login'}
			class="transition-colors duration-300 hover:text-stone-200 hover:underline"
		>
			{data.user ? 'profile' : 'login'}
		</a>
	</div>
</div>
