<script lang="ts">
	import { page } from '$app/stores';
	import { Home, FileText, Plus, MessageCircle } from 'lucide-svelte';
	import { _ } from 'svelte-i18n';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { cn } from '$lib/utils';
	import CreateApplicationDialog from '$lib/components/application/CreateApplicationDialog.svelte';

	const navItems = $derived([
		{ label: $_('navigation.home'), href: '/', icon: Home },
		{ label: $_('navigation.applications'), href: '/applications', icon: FileText },
		{ label: $_('navigation.new1003'), href: '#', icon: Plus, action: true },
		{ label: $_('navigation.aiCopilot'), href: '/ai/app', icon: MessageCircle }
	]);

	let showCreateDialog = $state(false);

	const openCreateDialog = () => {
		showCreateDialog = true;
	};

	const isActive = (href: string) => {
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		if (href === '/applications') {
			return $page.url.pathname === '/applications';
		}
		if (href === '/ai/app') {
			return $page.url.pathname.startsWith('/ai/app');
		}
		if (href.startsWith('/application/')) {
			return $page.url.pathname.startsWith('/application/');
		}
		return $page.url.pathname === href;
	};
</script>

<header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<nav class="container mx-auto px-4 h-16 flex items-center justify-between">
		<div class="flex items-center gap-1">
			{#each navItems as item}
				{@const Icon = item.icon}
				{#if item.action}
					<button
						onclick={openCreateDialog}
						class="px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
					>
						<Icon class="h-4 w-4" />
						{item.label}
					</button>
				{:else}
					<a
						href={item.href}
						class={cn(
							'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
							isActive(item.href)
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground hover:bg-muted'
						)}
					>
						<Icon class="h-4 w-4" />
						{item.label}
					</a>
				{/if}
			{/each}
		</div>

		<div class="ml-auto flex items-center gap-4">
			<LanguageSelector />
		</div>
	</nav>

	<!-- Create Application Confirmation Dialog -->
	<CreateApplicationDialog bind:open={showCreateDialog} />
</header>

