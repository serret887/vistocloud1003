<script lang="ts">
	import { page } from '$app/stores';
	import { applicationStore, currentStepId } from '$lib/stores/application';
	import { stepDefinitions, getStepPath } from '$lib/applicationSteps';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ChevronRight, Check, Circle, Home, AlertCircle } from 'lucide-svelte';
	import DebugPanel from '$lib/components/DebugPanel.svelte';
	import { getStepStatus } from '$lib/stepValidation';
	import { get } from 'svelte/store';
	
	let { children } = $props();
	
	import { getStepIdFromPath } from '$lib/applicationSteps';
	
	// Track if we've loaded the application to avoid reloading
	let hasLoadedApplication = $state(false);
	let lastAppId = $state<string | null>(null);
	
	// Get appId and stepId from URL params and initialize
	$effect(() => {
		const appId = $page.params.appId;
		
		// If appId changed or we haven't loaded yet, load the application
		if (appId && (appId !== lastAppId || !hasLoadedApplication)) {
			lastAppId = appId;
			hasLoadedApplication = false;
			
			// Load application from Firestore
			applicationStore.loadApplication(appId).then(() => {
				hasLoadedApplication = true;
				
				// Get step from URL path after loading
				const stepId = getStepIdFromPath($page.url.pathname);
				if (stepId && stepId !== $currentStepId) {
					applicationStore.setCurrentStep(stepId);
				} else if (!$currentStepId) {
					// Default to client-info if no step in URL
					applicationStore.setCurrentStep('client-info');
				}
			}).catch((error) => {
				console.error('Failed to load application:', error);
				// Still set the ID even if load fails (for new applications)
				applicationStore.setApplicationId(appId);
				hasLoadedApplication = true;
			});
		} else if (appId && hasLoadedApplication) {
			// Just update step if appId is the same but step might have changed
			const stepId = getStepIdFromPath($page.url.pathname);
			if (stepId && stepId !== $currentStepId) {
				applicationStore.setCurrentStep(stepId);
			}
		}
	});
	
	function getStepIcon(stepId: string) {
		// Get state from store for validation
		const state = get(applicationStore);
		return getStepStatus(stepId as any, $currentStepId, state);
	}
	
	// Get current step from URL to highlight correctly
	const currentStepFromUrl = $derived(getStepIdFromPath($page.url.pathname));
	
	async function navigateToStep(stepId: string) {
		const appId = $page.params.appId;
		if (appId) {
			const stepPath = getStepPath(appId, stepId as any);
			await goto(stepPath);
			await applicationStore.setCurrentStep(stepId as any);
		}
	}
</script>

<div class="min-h-screen bg-background">
	<!-- Top Navigation -->
	<header class="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
		<div class="container mx-auto px-4 h-16 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<a href="/" class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
					<Home class="h-5 w-5" />
					<span class="font-medium">VistoCloud</span>
				</a>
				<ChevronRight class="h-4 w-4 text-muted-foreground" />
				<span class="font-medium">Application</span>
			</div>
			
			<div class="text-sm text-muted-foreground">
				App ID: <code class="bg-muted px-2 py-1 rounded text-xs">{$page.params.appId?.slice(0, 12)}...</code>
			</div>
		</div>
	</header>
	
	<div class="flex h-[calc(100vh-4rem)]">
		<!-- Fixed Sidebar -->
		<aside class="w-[280px] border-r bg-card/50 backdrop-blur-sm overflow-y-auto shrink-0">
			<nav class="p-4 space-y-1">
				{#each stepDefinitions as step, idx}
					{@const status = getStepIcon(step.id)}
					<button
						onclick={() => navigateToStep(step.id)}
						class={cn(
							'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all',
							step.id === currentStepFromUrl
								? 'bg-primary text-primary-foreground shadow-md'
								: 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
						)}
					>
						<div class={cn(
							'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
							step.id === currentStepFromUrl
								? 'bg-primary-foreground/20 text-primary-foreground'
								: status === 'completed'
									? 'bg-success/10 text-success'
									: status === 'incomplete'
										? 'bg-warning/10 text-warning'
										: 'bg-muted text-muted-foreground'
						)}>
							{#if status === 'completed'}
								<Check class="h-4 w-4" />
							{:else if status === 'incomplete'}
								<AlertCircle class="h-4 w-4" />
							{:else}
								{idx + 1}
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<div class="font-medium truncate">{step.title}</div>
							<div class={cn(
								'text-xs truncate',
								step.id === currentStepFromUrl
									? 'text-primary-foreground/70'
									: 'text-muted-foreground'
							)}>
								{step.description}
							</div>
						</div>
					</button>
				{/each}
			</nav>
		</aside>
		
		<!-- Scrollable Main content area -->
		<main class="flex-1 overflow-y-auto">
			<div class="container mx-auto px-4 py-8">
				{@render children()}
			</div>
		</main>
	</div>
	
	<!-- Debug Panel (only in dev mode) -->
	<DebugPanel />
</div>

