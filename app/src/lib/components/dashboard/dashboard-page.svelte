<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Activity from 'lucide-svelte/icons/activity';
	import Mail from 'lucide-svelte/icons/mail';
	import MailCheck from 'lucide-svelte/icons/mail-check';
	import Users from 'lucide-svelte/icons/users';
	import { Overview, RecentSales } from './index.js';

	const stats = [
		{
			title: 'Total messages',
			value: '45,231',
			description: '+20.1% from last month',
			icon: Mail
		},
		{
			title: 'Delivery',
			value: '45,200',
			description: '+180.1% from last month',
			icon: MailCheck
		},
		{
			title: 'Clients',
			value: '+12,234',
			description: '+19% from last month',
			icon: Users
		},
		{
			title: 'Active Now',
			value: '573',
			description: '1,201 active last hour',
			icon: Activity
		}
	];
</script>

<Tabs.Root value="overview" class="space-y-4">
	<Tabs.List>
		<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
		<Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
		<Tabs.Trigger value="reports">Reports</Tabs.Trigger>
		<Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="overview" class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{#each stats as stat}
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">{stat.title}</Card.Title>
						<stat.icon class="text-muted-foreground h-4 w-4" />
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{stat.value}</div>
						<p class="text-muted-foreground text-xs">{stat.description}</p>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
			<Card.Root class="col-span-4">
				<Card.Header>
					<Card.Title>Overview</Card.Title>
				</Card.Header>
				<Card.Content>
					<Overview />
				</Card.Content>
			</Card.Root>
			<Card.Root class="col-span-3">
				<Card.Header>
					<Card.Title>Recent Subscribers</Card.Title>
					<Card.Description>You had 25 subscribers past 1 hour.</Card.Description>
				</Card.Header>
				<Card.Content>
					<RecentSales />
				</Card.Content>
			</Card.Root>
		</div>
	</Tabs.Content>
</Tabs.Root>
