<script lang="ts">
	import { applicationStore } from '$lib/stores/application';
	import { isDebugMode, debug } from '$lib/debug';
	import { Button } from '$lib/components/ui';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
	import { X, Save, RefreshCw } from 'lucide-svelte';
	
	let isOpen = $state(false);
	let isSaving = $derived($applicationStore.isSaving);
	let lastSaved = $derived($applicationStore.lastSaved);
	
	if (!isDebugMode) {
		// Don't render in production
	}
	
	function togglePanel() {
		isOpen = !isOpen;
	}
	
	async function handleSave() {
		try {
			await applicationStore.saveToFirebase();
		} catch (error) {
			console.error('Save failed:', error);
		}
	}
	
	function handleReset() {
		if (confirm('Reset all application data? This cannot be undone.')) {
			applicationStore.reset();
		}
	}
</script>

{#if isDebugMode}
	<!-- Debug Toggle Button -->
	{#if isOpen}
		<button
			onclick={togglePanel}
			class="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors"
			title="Debug Panel"
		>
			<X class="h-5 w-5" />
		</button>
	{:else}
		<button
			onclick={togglePanel}
			class="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors"
			title="Debug Panel"
		>
			<RefreshCw class="h-5 w-5" />
		</button>
	{/if}
	
	<!-- Debug Panel -->
	{#if isOpen}
		<div class="fixed bottom-20 right-4 z-50 w-96 max-h-[80vh] overflow-auto bg-card border rounded-lg shadow-xl">
			<Card>
				<CardHeader class="flex flex-row items-center justify-between">
					<CardTitle class="text-sm">Debug Panel</CardTitle>
					<Button variant="ghost" size="icon" onclick={togglePanel}>
						<X class="h-4 w-4" />
					</Button>
				</CardHeader>
				<CardContent class="space-y-4">
					<!-- Save Status -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">Save Status</span>
							{#if isSaving}
								<span class="text-xs text-muted-foreground">Saving...</span>
							{:else if lastSaved}
								<span class="text-xs text-muted-foreground">
									Saved {new Date(lastSaved).toLocaleTimeString()}
								</span>
							{:else}
								<span class="text-xs text-warning">Not saved</span>
							{/if}
						</div>
						<Button onclick={handleSave} disabled={isSaving} class="w-full" size="sm">
							<Save class="h-4 w-4 mr-2" />
							Save to Firebase
						</Button>
					</div>
					
					<!-- Application Info -->
					<div class="space-y-2">
						<div class="text-sm font-medium">Application Info</div>
						<div class="text-xs space-y-1">
							<div>App ID: {$applicationStore.currentApplicationId || 'Not set'}</div>
							<div>Active Client: {$applicationStore.activeClientId}</div>
							<div>Clients: {$applicationStore.clientIds.length}</div>
							<div>Current Step: {$applicationStore.currentStepId}</div>
						</div>
					</div>
					
					<!-- Store State -->
					<div class="space-y-2">
						<div class="text-sm font-medium">Store State</div>
						<details class="text-xs">
							<summary class="cursor-pointer text-muted-foreground">View Full State</summary>
							<pre class="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
{JSON.stringify($applicationStore, null, 2)}
							</pre>
						</details>
					</div>
					
					<!-- Actions -->
					<div class="space-y-2">
						<Button onclick={handleReset} variant="destructive" size="sm" class="w-full">
							Reset Application
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}
{/if}

