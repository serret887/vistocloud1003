<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '$lib/components/ui';
	import { Button, Badge, Textarea } from '$lib/components/ui';
	import { Upload, FileText, CheckCircle, AlertCircle, Trash2, CreditCard, DollarSign, Building2, Home, FileCheck, MessageSquare, History, ChevronDown, ChevronUp } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	import { applicationStore, activeClientId, activeClientData, activeEmploymentData } from '$lib/stores/application';
	import type { DocumentRecord, DocumentHistoryEntry } from '$lib/stores/application';
	import { generateConditions } from '$lib/conditions';
	import type { Condition } from '$lib/types/conditions';
	import { get } from 'svelte/store';
	
	let expandedConditions = $state<Set<string>>(new Set());
	let showHistoryFor = $state<string | null>(null);
	let noteInputs = $state<Record<string, string>>({});
	
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
	
	function getDocumentsForCondition(conditionId: string): DocumentRecord[] {
		const docs = $applicationStore.documentsData[$activeClientId]?.documents || [];
		// Support both new structure (conditionId) and old structure (id === conditionId)
		return docs.filter(d => (d.conditionId || d.id) === conditionId).sort((a, b) => {
			// Sort by version (newest first) or upload date
			if (a.version && b.version) return b.version - a.version;
			if (a.uploadedAt && b.uploadedAt) return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
			return 0;
		});
	}
	
	function getConditionHistory(conditionId: string): DocumentHistoryEntry[] {
		const history = $applicationStore.documentsData[$activeClientId]?.history || [];
		// Get history for this condition (by conditionId or documentId)
		return history
			.filter(h => {
				const docs = getDocumentsForCondition(conditionId);
				return docs.some(d => d.id === h.documentId) || h.documentId === conditionId;
			})
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	}
	
	function getConditionNotes(conditionId: string): string[] {
		return $applicationStore.documentsData[$activeClientId]?.conditionNotes?.[conditionId] || [];
	}
	
	function toggleCondition(conditionId: string) {
		if (expandedConditions.has(conditionId)) {
			expandedConditions.delete(conditionId);
		} else {
			expandedConditions.add(conditionId);
		}
		expandedConditions = new Set(expandedConditions);
	}
	
	function toggleHistory(conditionId: string) {
		showHistoryFor = showHistoryFor === conditionId ? null : conditionId;
	}
	
	function addNote(conditionId: string) {
		const note = noteInputs[conditionId]?.trim();
		if (note) {
			applicationStore.addConditionNote($activeClientId, conditionId, note);
			noteInputs[conditionId] = '';
		}
	}
	
	function handleFileUpload(conditionId: string, event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		if (files && files.length > 0) {
			// Create a document type based on condition category
			const categoryMap: Record<string, DocumentRecord['type']> = {
				'ID': 'id',
				'Income': 'income',
				'Assets': 'bank',
				'Property': 'employment',
				'Credit': 'employment'
			};
			const type = categoryMap[documentRequirements.find(d => d.id === conditionId)?.category || 'Income'] || 'income';
			
			// Upload each file
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				applicationStore.uploadDocument($activeClientId, conditionId, type, file);
			}
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
						{@const uploadedDocs = getDocumentsForCondition(doc.id)}
						{@const conditionNotes = getConditionNotes(doc.id)}
						{@const history = getConditionHistory(doc.id)}
						{@const isExpanded = expandedConditions.has(doc.id)}
						<div class="rounded-lg border bg-card">
							<!-- Condition Header -->
							<div class="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
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
											{#if uploadedDocs.length > 0}
												<Badge variant="outline" class="text-xs">
													{uploadedDocs.length} file{uploadedDocs.length !== 1 ? 's' : ''}
												</Badge>
											{/if}
										</div>
										<div class="text-sm text-muted-foreground mt-1">{doc.description}</div>
						</div>
					</div>
								<div class="flex items-center gap-2 shrink-0">
									{#if uploadedDocs.length > 0}
										<span class="flex items-center gap-1 text-sm text-success">
											<CheckCircle class="h-4 w-4" />
											Uploaded
										</span>
									{:else}
							<span class="flex items-center gap-1 text-sm text-muted-foreground">
								<AlertCircle class="h-4 w-4" />
								Required
							</span>
									{/if}
									<Button 
										variant="ghost" 
										size="sm" 
										onclick={() => toggleCondition(doc.id)}
									>
										{#if isExpanded}
											<ChevronUp class="h-4 w-4" />
						{:else}
											<ChevronDown class="h-4 w-4" />
						{/if}
						</Button>
					</div>
							</div>
							
							<!-- Expanded Content -->
							{#if isExpanded}
								<div class="border-t p-4 space-y-4">
									<!-- File Upload -->
									<div>
										<label>
											<Button variant="outline" size="sm" class="gap-2 cursor-pointer" as="span">
												<Upload class="h-4 w-4" />
												Upload File{uploadedDocs.length > 0 ? ' (Additional)' : ''}
											</Button>
											<input
												type="file"
												class="hidden"
												accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
												multiple
												onchange={(e) => handleFileUpload(doc.id, e)}
											/>
										</label>
									</div>
									
									<!-- Uploaded Files -->
									{#if uploadedDocs.length > 0}
										<div class="space-y-2">
											<div class="text-sm font-medium">Uploaded Files:</div>
											{#each uploadedDocs as uploadedDoc}
												<div class="flex items-center justify-between p-2 rounded bg-muted/50">
													<div class="flex items-center gap-2 flex-1">
														<FileText class="h-4 w-4 text-muted-foreground" />
														<div class="flex-1 min-w-0">
															<div class="text-sm font-medium truncate">{uploadedDoc.filename}</div>
															<div class="text-xs text-muted-foreground">
																{formatFileSize(uploadedDoc.sizeBytes)} • 
																{uploadedDoc.uploadedAt ? new Date(uploadedDoc.uploadedAt).toLocaleDateString() : 'Unknown date'}
																{#if uploadedDoc.version && uploadedDoc.version > 1}
																	• Version {uploadedDoc.version}
																{/if}
															</div>
														</div>
													</div>
													<Button 
														variant="ghost" 
														size="sm" 
														class="gap-2 text-destructive hover:text-destructive"
														onclick={() => handleRemoveDocument(uploadedDoc.id)}
													>
														<Trash2 class="h-4 w-4" />
													</Button>
												</div>
											{/each}
										</div>
									{/if}
									
									<!-- Notes Section -->
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<div class="text-sm font-medium">Notes & Comments:</div>
											<Button 
												variant="ghost" 
												size="sm" 
												onclick={() => toggleHistory(doc.id)}
												class="gap-2"
											>
												<History class="h-4 w-4" />
												History ({history.length})
											</Button>
										</div>
										
										<!-- Add Note -->
										<div class="flex gap-2">
											<Textarea
												placeholder="Add a note or comment about this document..."
												value={noteInputs[doc.id] || ''}
												oninput={(e) => noteInputs[doc.id] = e.currentTarget.value}
												class="min-h-[60px]"
											/>
											<Button 
												size="sm" 
												onclick={() => addNote(doc.id)}
												disabled={!noteInputs[doc.id]?.trim()}
											>
												<MessageSquare class="h-4 w-4" />
											</Button>
										</div>
										
										<!-- Display Notes -->
										{#if conditionNotes.length > 0}
											<div class="space-y-1">
												{#each conditionNotes as note}
													<div class="text-sm p-2 rounded bg-muted/30">
														{note}
													</div>
												{/each}
											</div>
										{/if}
										
										<!-- History -->
										{#if showHistoryFor === doc.id && history.length > 0}
											<div class="mt-4 space-y-2 border-t pt-4">
												<div class="text-sm font-medium">History:</div>
												<div class="space-y-2 max-h-60 overflow-y-auto">
													{#each history as entry}
														<div class="text-xs p-2 rounded bg-muted/30">
															<div class="flex items-center justify-between">
																<span class="font-medium">{entry.action}</span>
																<span class="text-muted-foreground">
																	{new Date(entry.timestamp).toLocaleString()}
																</span>
															</div>
															{#if entry.filename}
																<div class="text-muted-foreground mt-1">File: {entry.filename}</div>
															{/if}
															{#if entry.note}
																<div class="text-muted-foreground mt-1">Note: {entry.note}</div>
															{/if}
															<div class="text-muted-foreground mt-1">By: {entry.user}</div>
														</div>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								</div>
							{/if}
				</div>
			{/each}
		</CardContent>
	</Card>
		{/each}
	{/if}
</div>

