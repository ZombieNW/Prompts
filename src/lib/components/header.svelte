<script>
	export let data;
	let showSubMenu = false;
</script>

<div
	class="absolute top-4 flex w-full items-center justify-center px-6 py-1 text-stone-400 md:justify-between"
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

			{#if data.user}
				<div class="invisible absolute right-0 w-full pt-2 group-hover:visible">
					<div class="w-full pt-2 text-right">
						{#if data.user.is_admin}
							<a
								href="/admin"
								class="transition-colors duration-300 hover:text-stone-200 hover:underline"
							>
								admin
							</a>
						{/if}
						<form method="POST" action="/logout">
							<button
								type="submit"
								class="block w-full py-2 pl-2 text-right transition-colors duration-300 hover:cursor-pointer hover:text-stone-300 hover:underline"
								>logout</button
							>
						</form>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
