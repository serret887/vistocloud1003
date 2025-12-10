<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Home, FileText, Plus, MessageCircle } from 'lucide-svelte';
	import { applicationStore } from '$lib/stores/application/index';
	import { toast } from 'svelte-sonner';
	import { _ } from 'svelte-i18n';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { cn } from '$lib/utils';

	const navItems = [
		{ label: 'Home', href: '/', icon: Home },
		{ label: 'Applications', href: '/applications', icon: FileText },
		{ label: 'New 1003', href: '#', icon: Plus, action: true },
		{ label: 'AI Copilot', href: '/ai/app', icon: MessageCircle }
	];

	const createNewApplication = async () => {
		try {
			const id = await applicationStore.createApplication();
			toast.success($_('toast.applicationCreated'), { description: $_('toast.applicationCreatedDescription') });
			goto(`/application/${id}/client-info`);
		} catch (error) {
			toast.error($_('toast.applicationCreateFailed'), {
				description: error instanceof Error ? error.message : $_('toast.applicationCreateFailedDescription')
			});
		}
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
				{#if item.action}
					<button
						onclick={createNewApplication}
						class="px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
					>
						<svelte:component this={item.icon} class="h-4 w-4" />
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
						<svelte:component this={item.icon} class="h-4 w-4" />
						{item.label}
					</a>
				{/if}
			{/each}
		</div>

		<div class="ml-auto flex items-center gap-4">
			<LanguageSelector />
		</div>
	</nav>
</header>

