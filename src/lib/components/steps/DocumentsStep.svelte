<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '$lib/components/ui';
	import { Button, Badge } from '$lib/components/ui';
	import { Upload, FileText, CheckCircle, AlertCircle, Trash2, CreditCard, DollarSign, Building2, Home, FileCheck } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	import { applicationStore, activeClientId, activeClientData, activeEmploymentData } from '$lib/stores/application';
	import type { DocumentRecord } from '$lib/stores/application';
	import { generateConditions } from '$lib/conditions';
	import type { Condition } from '$lib/types/conditions';
	import { get } from 'svelte/store';
	
	// Generate document requirements based on application data
	let documentRequirements = $derived.by(() => {
		const client = $activeClientData;
		const employmentRecords = $activeEmploymentData?.records || [];
		const assets = $applicationStore.assetsData[$activeClientId]?.records || [];
		
		if (!client || !client.firstName) {
			return [];
		}
		
		// Generate conditions using the condition generator
		const conditions = generateConditions({
			clientId: $activeClientId,
			client,
			employmentData: employmentRecords,
			assets
		});
		
		// Group conditions by category and convert to document requirements
		return conditions.map(condition => ({
			id: condition.id,
			title: condition.title,
			description: condition.description,
			category: condition.category,
			priority: condition.priority,
			condition: condition
		}));
	});
	
	// Group documents by category
	let documentsByCategory = $derived.by(() => {
		const grouped: Record<string, typeof documentRequirements> = {};
		for (const doc of documentRequirements) {
			if (!grouped[doc.category]) {
				grouped[doc.category] = [];
			}
			grouped[doc.category].push(doc);
		}
		return grouped;
	});
	
	function getDocumentForCondition(conditionId: string): DocumentRecord | undefined {
		const docs = $applicationStore.documentsData[$activeClientId]?.documents || [];
		return docs.find(d => d.id === conditionId);
	}
	
	function handleFileUpload(conditionId: string, conditionTitle: string, event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			// Create a document type based on condition category
			const categoryMap: Record<string, DocumentRecord['type']> = {
				'ID': 'id',
				'Income': 'income',
				'Assets': 'bank',
				'Property': 'employment',
				'Credit': 'employment'
			};
			const type = categoryMap[documentRequirements.find(d => d.id === conditionId)?.category || 'Income'] || 'income';
			
			// Use condition ID as document ID to link them
			const newDocument: DocumentRecord = {
				id: conditionId,
				type,
				filename: file.name,
				sizeBytes: file.size,
				mimeType: file.type,
				status: 'uploaded',
				uploadedAt: new Date().toISOString(),
				verifiedAt: null
			};
			
			// Update store directly
			const currentDocs = $applicationStore.documentsData[$activeClientId] || { clientId: $activeClientId, documents: [] };
			const filteredDocs = currentDocs.documents.filter(d => d.id !== conditionId);
			
			applicationStore.update(state => ({
				...state,
				documentsData: {
					...state.documentsData,
					[$activeClientId]: {
						...currentDocs,
						documents: [...filteredDocs, newDocument]
					}
				}
			}));
		}
		// Reset input so same file can be selected again
		input.value = '';
	}
	
	function handleRemoveDocument(documentId: string) {
		applicationStore.removeDocument($activeClientId, documentId);
	}
	
	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}
	
	function getCategoryIcon(category: string) {
		switch (category) {
			case 'ID': return CreditCard;
			case 'Income': return DollarSign;
			case 'Assets': return Building2;
			case 'Property': return Home;
			case 'Credit': return FileCheck;
			default: return FileText;
		}
	}
	
	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'high': return 'text-destructive';
			case 'medium': return 'text-warning';
			case 'low': return 'text-muted-foreground';
			default: return 'text-muted-foreground';
		}
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	{#if documentRequirements.length === 0}
		<Card>
			<CardContent class="py-12">
				<div class="text-center space-y-4">
					<AlertCircle class="h-12 w-12 text-muted-foreground mx-auto" />
					<div>
						<h3 class="font-medium text-lg">No Documents Required Yet</h3>
						<p class="text-muted-foreground text-sm">
							Complete the previous steps (Client Info, Employment, Income) to see required documents.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{:else}
		{#each Object.entries(documentsByCategory) as [category, docs]}
			{@const CategoryIcon = getCategoryIcon(category)}
			<Card>
				<CardHeader>
					<div class="flex items-center gap-2">
						<CategoryIcon class="h-5 w-5 text-primary" />
						<CardTitle>{category} Documents</CardTitle>
					</div>
					<CardDescription>
						{docs.length} document{docs.length !== 1 ? 's' : ''} required
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					{#each docs as doc}
						{@const uploadedDoc = getDocumentForCondition(doc.id)}
						<div class="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
							<div class="flex items-center gap-4 flex-1">
								<div class="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
									<FileText class="h-5 w-5 text-muted-foreground" />
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<div class="font-medium">{doc.title}</div>
										<Badge variant={doc.priority === 'high' ? 'destructive' : doc.priority === 'medium' ? 'default' : 'secondary'} class="text-xs">
											{doc.priority}
										</Badge>
									</div>
									<div class="text-sm text-muted-foreground mt-1">{doc.description}</div>
									{#if uploadedDoc}
										<div class="text-xs text-muted-foreground mt-1">
											{uploadedDoc.filename} ({formatFileSize(uploadedDoc.sizeBytes)})
										</div>
									{/if}
								</div>
							</div>
							<div class="flex items-center gap-3 shrink-0">
								{#if uploadedDoc && uploadedDoc.status === 'uploaded'}
									<span class="flex items-center gap-1 text-sm text-success">
										<CheckCircle class="h-4 w-4" />
										Uploaded
									</span>
									<Button 
										variant="ghost" 
										size="sm" 
										class="gap-2 text-destructive hover:text-destructive"
										onclick={() => handleRemoveDocument(uploadedDoc.id)}
									>
										<Trash2 class="h-4 w-4" />
										Remove
									</Button>
								{:else}
									<span class="flex items-center gap-1 text-sm text-muted-foreground">
										<AlertCircle class="h-4 w-4" />
										Required
									</span>
									<label>
										<Button variant="outline" size="sm" class="gap-2 cursor-pointer" as="span">
											<Upload class="h-4 w-4" />
											Upload
										</Button>
										<input
											type="file"
											class="hidden"
											accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
											onchange={(e) => handleFileUpload(doc.id, doc.title, e)}
										/>
									</label>
								{/if}
							</div>
						</div>
					{/each}
				</CardContent>
			</Card>
		{/each}
	{/if}
</div>

