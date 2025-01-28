<script>
	import { DashboardMainNav, Search, UserNav } from '$lib/components/dashboard';
	import '../../app.css';
	let { data, children } = $props();
	let { supabase, user } = $derived(data);

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		}
	};
</script>

<svelte:head>
	<title>Stream X</title>
</svelte:head>

<div class="hidden flex-col md:flex">
	<div class="border-b">
		<div class="flex h-16 items-center px-4">
			<div class="font-bold">StreamX</div>
			<div class="mx-6">
				<DashboardMainNav {logout} />
			</div>
			<div class="ml-auto flex items-center space-x-4">
				<Search />
				<UserNav {user} />
			</div>
		</div>
	</div>
	<div class="flex-1 space-y-4 p-8 pt-6">
		{@render children()}
	</div>
</div>
