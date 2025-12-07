<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '$lib/components/ui';
  import { CreditCard, DollarSign, Building2, Home, FileCheck, FileText, AlertCircle } from 'lucide-svelte';
  import ClientTabs from '../ClientTabs.svelte';
  import ConditionCard from './ConditionCard.svelte';
  import { applicationStore, activeClientId, activeClientData, activeEmploymentData } from '$lib/stores/application';
  import type { DocumentRecord, DocumentHistoryEntry } from '$lib/stores/application';
  import { generateConditions } from '$lib/conditions';
  
  let expandedConditions = $state<Set<string>>(new Set());
  let showHistoryFor = $state<string | null>(null);
  let noteInputs = $state<Record<string, string>>({});
  
  const documentRequirements = $derived.by(() => {
    const client = $activeClientData;
    const employmentRecords = $activeEmploymentData?.records || [];
    const assets = $applicationStore.assetsData[$activeClientId]?.records || [];
    
    if (!client?.firstName) return [];
    
    return generateConditions({ clientId: $activeClientId, client, employmentData: employmentRecords, assets }).map(c => ({
      id: c.id, title: c.title, description: c.description, category: c.category, priority: c.priority
    }));
  });
  
  const documentsByCategory = $derived.by(() => {
    const grouped: Record<string, typeof documentRequirements> = {};
    for (const doc of documentRequirements) {
      if (!grouped[doc.category]) grouped[doc.category] = [];
      grouped[doc.category].push(doc);
    }
    return grouped;
  });
  
  function getDocumentsForCondition(conditionId: string): DocumentRecord[] {
    return ($applicationStore.documentsData[$activeClientId]?.documents || [])
      .filter(d => (d.conditionId || d.id) === conditionId)
      .sort((a, b) => (b.version || 1) - (a.version || 1));
  }
  
  function getConditionHistory(conditionId: string): DocumentHistoryEntry[] {
    const history = $applicationStore.documentsData[$activeClientId]?.history || [];
    const docs = getDocumentsForCondition(conditionId);
    return history.filter(h => docs.some(d => d.id === h.documentId) || h.documentId === conditionId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  function getConditionNotes(conditionId: string): string[] {
    return $applicationStore.documentsData[$activeClientId]?.conditionNotes?.[conditionId] || [];
  }
  
  function toggleCondition(id: string) { expandedConditions = new Set(expandedConditions.has(id) ? [...expandedConditions].filter(x => x !== id) : [...expandedConditions, id]); }
  function toggleHistory(id: string) { showHistoryFor = showHistoryFor === id ? null : id; }
  function addNote(id: string) { const note = noteInputs[id]?.trim(); if (note) { applicationStore.addConditionNote($activeClientId, id, note); noteInputs[id] = ''; } }
  
  function handleFileUpload(conditionId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      const typeMap: Record<string, DocumentRecord['type']> = { 'ID': 'id', 'Income': 'income', 'Assets': 'bank' };
      const type = typeMap[documentRequirements.find(d => d.id === conditionId)?.category || 'Income'] || 'income';
      for (let i = 0; i < files.length; i++) applicationStore.uploadDocument($activeClientId, conditionId, type, files[i]);
    }
    input.value = '';
  }
  
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  const categoryIcons: Record<string, any> = { 'ID': CreditCard, 'Income': DollarSign, 'Assets': Building2, 'Property': Home, 'Credit': FileCheck };
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <ClientTabs />
  
  {#if documentRequirements.length === 0}
    <Card>
      <CardContent class="py-12 text-center">
        <AlertCircle class="h-12 w-12 text-muted-foreground mx-auto" />
        <h3 class="font-medium text-lg mt-4">No Documents Required Yet</h3>
        <p class="text-muted-foreground text-sm">Complete previous steps to see required documents.</p>
      </CardContent>
    </Card>
  {:else}
    {#each Object.entries(documentsByCategory) as [category, docs]}
      {@const CategoryIcon = categoryIcons[category] || FileText}
      <Card>
        <CardHeader>
          <div class="flex items-center gap-2"><CategoryIcon class="h-5 w-5 text-primary" /><CardTitle>{category} Documents</CardTitle></div>
          <CardDescription>{docs.length} document{docs.length !== 1 ? 's' : ''} required</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          {#each docs as doc}
            <ConditionCard
              id={doc.id}
              title={doc.title}
              description={doc.description}
              priority={doc.priority}
              uploadedDocs={getDocumentsForCondition(doc.id)}
              notes={getConditionNotes(doc.id)}
              history={getConditionHistory(doc.id)}
              isExpanded={expandedConditions.has(doc.id)}
              showHistory={showHistoryFor === doc.id}
              noteInput={noteInputs[doc.id] || ''}
              onToggle={() => toggleCondition(doc.id)}
              onToggleHistory={() => toggleHistory(doc.id)}
              onUpload={(e) => handleFileUpload(doc.id, e)}
              onRemoveDoc={(docId) => applicationStore.removeDocument($activeClientId, docId)}
              onAddNote={() => addNote(doc.id)}
              onNoteInputChange={(v) => noteInputs[doc.id] = v}
              {formatFileSize}
            />
          {/each}
        </CardContent>
      </Card>
    {/each}
  {/if}
</div>



