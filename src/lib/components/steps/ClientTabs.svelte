<script lang="ts">
	import { applicationStore, activeClientId, clientIds } from '$lib/stores/application';
	import { cn } from '$lib/utils';
	import { Plus, User } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	
	function setActiveClient(clientId: string) {
		applicationStore.setActiveClient(clientId);
	}
	
	function addClient() {
		applicationStore.addClient();
	}
</script>

<div class="flex items-center gap-2 pb-4 border-b mb-6">
	<div class="flex items-center gap-1 flex-1">
		{#each $clientIds as clientId, idx}
			<button
				onclick={() => setActiveClient(clientId)}
				class={cn(
					'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
					$activeClientId === clientId
						? 'bg-primary text-primary-foreground shadow-md'
						: 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
				)}
			>
				<User class="h-4 w-4" />
				{idx === 0 ? 'Primary Borrower' : `Co-Borrower ${idx}`}
			</button>
		{/each}
	</div>
	
	<Button variant="outline" size="sm" onclick={addClient} class="gap-2">
		<Plus class="h-4 w-4" />
		Add Co-Borrower
	</Button>
</div>

