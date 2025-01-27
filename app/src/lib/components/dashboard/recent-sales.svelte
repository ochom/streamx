<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	const clients = [
		{
			instanceName: 'Sakata',
			channel: 'BNN',
			clientID: crypto.randomUUID(),
			messages: Math.floor(Math.random() * 100)
		},
		{
			instanceName: 'Sakata',
			channel: 'LOSES',
			clientID: crypto.randomUUID(),
			messages: Math.floor(Math.random() * 1000)
		},
		{
			instanceName: 'Sakata',
			channel: 'WINS',
			clientID: crypto.randomUUID(),
			messages: Math.floor(Math.random() * 1000)
		},
		{
			instanceName: 'Sakata',
			channel: 'NOTIFICATION',
			clientID: crypto.randomUUID(),
			messages: Math.floor(Math.random() * 1000)
		},
		{
			instanceName: 'Sakata',
			channel: 'ACCOUNTS',
			clientID: crypto.randomUUID(),
			messages: Math.floor(Math.random() * 1000)
		}
	];
</script>

<div class="space-y-8">
	{#each clients as client}
		<div class="flex items-center">
			<Avatar.Root class="h-9 w-9">
				<Avatar.Image src="/avatars/01.png" alt="Avatar" />
				<Avatar.Fallback>{client.instanceName.slice(0, 2)}</Avatar.Fallback>
			</Avatar.Root>
			<div class="ml-4 space-y-1">
				<p class="text-sm font-medium leading-none">
					Instance: {client.instanceName}, Channel: {client.channel}
				</p>
				<p class="text-muted-foreground text-sm">Client ID: {client.clientID}</p>
			</div>
			<div class="ml-auto font-medium">{client.messages}</div>
		</div>
	{/each}
</div>
