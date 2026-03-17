<script>
	export let data;
</script>

<div
	class="absolute top-4 flex w-full flex-col items-center justify-center gap-2 px-6 py-1 text-stone-400 md:flex-row md:justify-between"
	style="view-transition-name: header"
>
	<a href="/" class="">Prompts, Not Prompts</a>
	<div class="flex gap-6">
		<div class="group relative">
			<a
				href={data.user ? '/profile' : '/login'}
				class="transition-colors duration-300 hover:text-stone-200 hover:underline"
			>
				{data.user ? data.user.username : 'login'}
			</a>
		</div>
	</div>
</div>
