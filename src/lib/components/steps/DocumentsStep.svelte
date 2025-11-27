<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
	import { Button } from '$lib/components/ui';
	import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	
	const requiredDocuments = [
		{ id: 'id', name: 'Government ID', description: 'Valid driver\'s license or passport', status: 'pending' },
		{ id: 'income', name: 'Income Verification', description: 'W-2s, pay stubs, or tax returns', status: 'pending' },
		{ id: 'bank', name: 'Bank Statements', description: 'Last 2 months of statements', status: 'pending' },
		{ id: 'employment', name: 'Employment Verification', description: 'Employment letter or verification', status: 'pending' }
	];
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	<Card>
		<CardHeader>
			<CardTitle>Required Documents</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			{#each requiredDocuments as doc}
				<div class="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
					<div class="flex items-center gap-4">
						<div class="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
							<FileText class="h-5 w-5 text-muted-foreground" />
						</div>
						<div>
							<div class="font-medium">{doc.name}</div>
							<div class="text-sm text-muted-foreground">{doc.description}</div>
						</div>
					</div>
					<div class="flex items-center gap-3">
						{#if doc.status === 'pending'}
							<span class="flex items-center gap-1 text-sm text-muted-foreground">
								<AlertCircle class="h-4 w-4" />
								Required
							</span>
						{:else}
							<span class="flex items-center gap-1 text-sm text-success">
								<CheckCircle class="h-4 w-4" />
								Uploaded
							</span>
						{/if}
						<Button variant="outline" size="sm" class="gap-2">
							<Upload class="h-4 w-4" />
							Upload
						</Button>
					</div>
				</div>
			{/each}
		</CardContent>
	</Card>
</div>

