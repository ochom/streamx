<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { DashboardPage } from '$lib/components/dashboard/index.js';
	import type { EventHandler } from 'svelte/elements';

	let { data } = $props();
	let { countries, supabase, user } = $derived(data);
</script>

<DashboardPage />
