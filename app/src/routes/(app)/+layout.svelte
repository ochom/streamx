<script>
	import '../../app.css';

	import { ModeWatcher } from 'mode-watcher';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';

	import { DashboardMainNav, Search, UserNav } from '$lib/components/dashboard';
	import { Toaster } from '$lib/components/ui/sonner';
	import Button from '$lib/components/ui/button/button.svelte';

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

<ModeWatcher />
<Toaster />

<div class="hidden flex-col md:flex">
	<div class="border-b">
		<div class="flex h-16 items-center px-4">
			<div class="font-bold">StreamX</div>
			<div class="mx-6">
				<DashboardMainNav {logout} />
			</div>
			<div class="ml-auto flex items-center space-x-4">
				<Search />
				<Button onclick={toggleMode} variant="outline" size="icon">
					<Sun
						class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
					/>
					<Moon
						class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
				<UserNav {user} />
			</div>
		</div>
	</div>
	<div class="flex-1 space-y-4 p-8 pt-6">
		{@render children()}
	</div>
</div>
