<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Home, FileText, Plus, MessageCircle } from 'lucide-svelte';
	import { applicationStore } from '$lib/stores/application/index';
	import { toast } from 'svelte-sonner';
	import { _ } from 'svelte-i18n';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { cn } from '$lib/utils';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui';

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

	const createNewApplication = async () => {
		showCreateDialog = false;
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
	<AlertDialog bind:open={showCreateDialog}>
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>{$_('dialogs.createApplication.title')}</AlertDialogTitle>
				<AlertDialogDescription>
					{$_('dialogs.createApplication.description')}
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel onclick={() => { showCreateDialog = false; }}>
					{$_('dialogs.createApplication.cancel')}
				</AlertDialogCancel>
				<AlertDialogAction onclick={createNewApplication}>
					{$_('dialogs.createApplication.confirm')}
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</header>

