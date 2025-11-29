<script lang="ts">
	import { applicationStore, activeClientId, clientIds, activeClientData } from '$lib/stores/application';
	import { cn } from '$lib/utils';
	import { Plus, User, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { derived } from 'svelte/store';
	
	function setActiveClient(clientId: string) {
		applicationStore.setActiveClient(clientId);
	}
	
	function addClient() {
		applicationStore.addClient();
	}
	
	function removeClient(clientId: string, event: MouseEvent) {
		event.stopPropagation();
		// Don't allow removing the last client
		if ($clientIds.length <= 1) {
			return;
		}
		applicationStore.removeClient(clientId);
	}
	
	// Create a derived store for client names
	const clientNames = derived(
		[applicationStore, clientIds],
		([$store, $ids]) => {
			const names: Record<string, string> = {};
			for (const clientId of $ids) {
				const client = $store.clientData[clientId];
				if (client?.firstName || client?.lastName) {
					const name = `${client.firstName || ''} ${client.lastName || ''}`.trim();
					names[clientId] = name || 'Unnamed Borrower';
				} else {
					names[clientId] = 'Unnamed Borrower';
				}
			}
			return names;
		}
	);
</script>

<div class="flex items-center gap-2 pb-4 border-b mb-6">
	<div class="flex items-center gap-1 flex-1">
		{#each $clientIds as clientId, idx}
			<button
				onclick={() => setActiveClient(clientId)}
				class={cn(
					'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all group relative',
					$activeClientId === clientId
						? 'bg-primary text-primary-foreground shadow-md'
						: 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
				)}
			>
				<User class="h-4 w-4 shrink-0" />
				<span>{$clientNames[clientId] || 'Unnamed Borrower'}</span>
				{#if $clientIds.length > 1}
					<button
						onclick={(e) => removeClient(clientId, e)}
						class="ml-2 p-1 rounded hover:bg-destructive/20 text-destructive shrink-0 flex items-center justify-center"
						title="Remove borrower"
					>
						<X class="h-4 w-4" />
					</button>
				{/if}
			</button>
		{/each}
	</div>
	
	<Button variant="outline" size="sm" onclick={addClient} class="gap-2">
		<Plus class="h-4 w-4" />
		Add Co-Borrower
	</Button>
</div>

