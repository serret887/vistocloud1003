<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Textarea } from '$lib/components/ui';
  import { FileText, CheckCircle, AlertCircle, Trash2, Upload, ChevronDown, ChevronUp, History, MessageSquare } from 'lucide-svelte';
  import type { DocumentRecord, DocumentHistoryEntry } from '$lib/stores/application/index';
  
  interface Props {
    id: string;
    title: string;
    description: string;
    priority: string;
    uploadedDocs: DocumentRecord[];
    notes: string[];
    history: DocumentHistoryEntry[];
    isExpanded: boolean;
    showHistory: boolean;
    noteInput: string;
    onToggle: () => void;
    onToggleHistory: () => void;
    onUpload: (event: Event) => void;
    onRemoveDoc: (docId: string) => void;
    onAddNote: () => void;
    onNoteInputChange: (value: string) => void;
    formatFileSize: (bytes: number) => string;
  }
  
  let { id, title, description, priority, uploadedDocs, notes, history, isExpanded, showHistory, noteInput, onToggle, onToggleHistory, onUpload, onRemoveDoc, onAddNote, onNoteInputChange, formatFileSize }: Props = $props();
</script>

<div class="rounded-lg border bg-card">
  <div class="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
    <div class="flex items-center gap-4 flex-1">
      <div class="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <FileText class="h-5 w-5 text-muted-foreground" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <div class="font-medium">{title}</div>
          <Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'secondary'} class="text-xs">{priority}</Badge>
          {#if uploadedDocs.length > 0}
            <Badge variant="outline" class="text-xs">{uploadedDocs.length} file{uploadedDocs.length !== 1 ? 's' : ''}</Badge>
          {/if}
        </div>
        <div class="text-sm text-muted-foreground mt-1">{description}</div>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      {#if uploadedDocs.length > 0}
        <span class="flex items-center gap-1 text-sm text-success"><CheckCircle class="h-4 w-4" />Uploaded</span>
      {:else}
        <span class="flex items-center gap-1 text-sm text-muted-foreground"><AlertCircle class="h-4 w-4" />Required</span>
      {/if}
      <Button variant="ghost" size="sm" onclick={onToggle}>
        {#if isExpanded}<ChevronUp class="h-4 w-4" />{:else}<ChevronDown class="h-4 w-4" />{/if}
      </Button>
    </div>
  </div>
  
  {#if isExpanded}
    <div class="border-t p-4 space-y-4">
      <label class="inline-flex">
        <Button variant="outline" size="sm" class="gap-2 cursor-pointer">
          <Upload class="h-4 w-4" />Upload File{uploadedDocs.length > 0 ? ' (Additional)' : ''}
        </Button>
        <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple onchange={onUpload} />
      </label>
      
      {#if uploadedDocs.length > 0}
        <div class="space-y-2">
          <div class="text-sm font-medium">Uploaded Files:</div>
          {#each uploadedDocs as doc}
            <div class="flex items-center justify-between p-2 rounded bg-muted/50">
              <div class="flex items-center gap-2 flex-1">
                <FileText class="h-4 w-4 text-muted-foreground" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">{doc.filename}</div>
                  <div class="text-xs text-muted-foreground">{formatFileSize(doc.sizeBytes)} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}{#if doc.version && doc.version > 1} • v{doc.version}{/if}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" onclick={() => onRemoveDoc(doc.id)}><Trash2 class="h-4 w-4" /></Button>
            </div>
          {/each}
        </div>
      {/if}
      
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium">Notes & Comments:</div>
          <Button variant="ghost" size="sm" onclick={onToggleHistory} class="gap-2"><History class="h-4 w-4" />History ({history.length})</Button>
        </div>
        <div class="flex gap-2">
          <Textarea placeholder="Add a note..." value={noteInput} oninput={(e) => onNoteInputChange(e.currentTarget.value)} class="min-h-[60px]" />
          <Button size="sm" onclick={onAddNote} disabled={!noteInput?.trim()}><MessageSquare class="h-4 w-4" /></Button>
        </div>
        {#if notes.length > 0}
          {#each notes as note}<div class="text-sm p-2 rounded bg-muted/30">{note}</div>{/each}
        {/if}
        {#if showHistory && history.length > 0}
          <div class="mt-4 space-y-2 border-t pt-4">
            <div class="text-sm font-medium">History:</div>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              {#each history as entry}
                <div class="text-xs p-2 rounded bg-muted/30">
                  <div class="flex justify-between"><span class="font-medium">{entry.action}</span><span class="text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span></div>
                  {#if entry.filename}<div class="text-muted-foreground mt-1">File: {entry.filename}</div>{/if}
                  {#if entry.note}<div class="text-muted-foreground mt-1">Note: {entry.note}</div>{/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>


