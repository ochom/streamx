<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '$lib/utils.js';

	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<div class={cn('grid gap-6', className)} {...$$restProps}>
	<div class="grid gap-2">
		<div class="grid gap-1">
			<Label for="email">Email</Label>
			<Input
				id="email"
				name="email"
				placeholder="email address"
				type="email"
				autocapitalize="none"
				autocomplete="email"
				autocorrect="off"
			/>
		</div>
		<div class="grid gap-1">
			<Label for="password">Password</Label>
			<Input
				id="password"
				name="password"
				placeholder="secure password"
				type="password"
				autocapitalize="none"
				autocomplete="email webauthn"
				autocorrect="off"
			/>
		</div>
		<Button type="submit">Sign In</Button>
	</div>
	<div class="relative">
		<div class="absolute inset-0 flex items-center">
			<span class="w-full border-t"></span>
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-background text-muted-foreground px-2"> Or continue with </span>
		</div>
	</div>
	<Button variant="outline" type="button">
		<Icon icon="octicon:mark-github-16" class="h-5 w-5" />
		GitHub</Button
	>
</div>
