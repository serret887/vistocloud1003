<script lang="ts">
	import { applicationStore, clientIds, activeClientId } from '$lib/stores/application';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
	import { Button, Badge } from '$lib/components/ui';
	import { CheckCircle, AlertCircle, Send } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	import { get } from 'svelte/store';
	
	let store = $derived(get(applicationStore));
	
	function getClientData(clientId: string) {
		return store.clientData[clientId];
	}
	
	function getEmploymentCount(clientId: string) {
		return store.employmentData[clientId]?.records?.length || 0;
	}
	
	function getAssetsCount(clientId: string) {
		return store.assetsData[clientId]?.records?.length || 0;
	}
	
	function isClientComplete(clientId: string) {
		const client = getClientData(clientId);
		return client?.firstName && client?.lastName && client?.email && client?.phone;
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	<Card>
		<CardHeader>
			<CardTitle>Application Summary</CardTitle>
		</CardHeader>
		<CardContent class="space-y-6">
			{#each $clientIds as clientId, idx}
				{@const client = getClientData(clientId)}
				{@const isComplete = isClientComplete(clientId)}
				
				<div class="p-4 rounded-lg border">
					<div class="flex items-center justify-between mb-4">
						<h3 class="font-medium">
							{client?.firstName || 'Client'} {client?.lastName || (idx + 1)}
							<span class="text-sm text-muted-foreground ml-2">
								{idx === 0 ? '(Primary Borrower)' : '(Co-Borrower)'}
							</span>
						</h3>
						{#if isComplete}
							<Badge variant="success" class="gap-1">
								<CheckCircle class="h-3 w-3" />
								Complete
							</Badge>
						{:else}
							<Badge variant="warning" class="gap-1">
								<AlertCircle class="h-3 w-3" />
								Incomplete
							</Badge>
						{/if}
					</div>
					
					<div class="grid md:grid-cols-3 gap-4 text-sm">
						<div>
							<div class="text-muted-foreground">Contact</div>
							<div>{client?.email || 'No email'}</div>
							<div>{client?.phone || 'No phone'}</div>
						</div>
						<div>
							<div class="text-muted-foreground">Employment</div>
							<div>{getEmploymentCount(clientId)} record(s)</div>
						</div>
						<div>
							<div class="text-muted-foreground">Assets</div>
							<div>{getAssetsCount(clientId)} record(s)</div>
						</div>
					</div>
				</div>
			{/each}
		</CardContent>
	</Card>
	
	<div class="flex justify-end gap-4">
		<Button variant="outline">Save Draft</Button>
		<Button class="gap-2">
			<Send class="h-4 w-4" />
			Submit Application
		</Button>
	</div>
</div>

