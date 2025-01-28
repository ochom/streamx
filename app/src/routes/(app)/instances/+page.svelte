<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { toast } from 'svelte-sonner';
	import Icon from '@iconify/svelte';
	import moment from 'moment';
	const { data } = $props();

	const handleCopy = (value: string) => {
		navigator.clipboard.writeText(value);
		toast.success('Instance ID Copied to clipboard');
	};
</script>

<main>
	StreamX Instances

	<Table.Root>
		<Table.Caption>A list of your all your active instances.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">Name</Table.Head>
				<Table.Head>Description</Table.Head>
				<Table.Head>Instance ID</Table.Head>
				<Table.Head>Created</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data?.instances as instance}
				<Table.Row>
					<Table.Cell class="font-medium">{instance.name}</Table.Cell>
					<Table.Cell>{instance.description}</Table.Cell>
					<Table.Cell>
						<div class="flex">
							{instance.id}
							<Icon
								onclick={() => handleCopy(instance.id)}
								icon="akar-icons:copy"
								class="text-muted-foreground h-5 w-5 cursor-pointer"
							/>
						</div>
					</Table.Cell>
					<Table.Cell>{moment(instance.created_at).format('lll')}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</main>
