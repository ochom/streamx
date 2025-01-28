<script lang="ts">
	import { afterNavigate } from '$app/navigation';

	const { logout } = $props();

	let currentRoute = $state();
	afterNavigate((navigation) => {
		currentRoute = navigation.to?.url.pathname as string;
	});

	const links = $derived.by(() => {
		return [
			{
				title: 'Overview',
				href: '/',
				active: currentRoute === '/'
			},
			{
				title: 'Instances',
				href: '/instances',
				active: currentRoute === '/instances'
			},
			{
				title: 'Clients',
				href: '/clients',
				active: currentRoute === '/clients'
			},
			{
				title: 'Settings',
				href: '/settings',
				active: currentRoute === '/settings'
			}
		];
	});
</script>

<nav class="flex items-center space-x-4 lg:space-x-6">
	{#each links as link}
		<a
			href={link.href}
			class:text-muted-foreground={!link.active}
			class="hover:text-primary text-sm font-medium transition-colors"
			>{link.title}
		</a>
	{/each}
</nav>
