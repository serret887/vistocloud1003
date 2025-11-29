<script lang="ts">
  import { Button } from '$lib/components/ui';
  import { CheckCircle, Copy, RefreshCw, ThumbsUp, ThumbsDown, Send } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import type { ChatMessage } from '$lib/types/voice-assistant';
  
  interface Props {
    message: ChatMessage;
    isPendingTranscription: boolean | null;
    pendingTranscription: string | null;
    isProcessing: boolean;
    onUpdateTranscription: (value: string) => void;
    onSendTranscription: () => void;
    onCancelTranscription: () => void;
    onCopyMessage: () => void;
    onRetryMessage: () => void;
  }
  
  let { message, isPendingTranscription, pendingTranscription, isProcessing, onUpdateTranscription, onSendTranscription, onCancelTranscription, onCopyMessage, onRetryMessage }: Props = $props();
</script>

<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
  <div class="max-w-[85%] group">
    {#if message.role === 'user' && isPendingTranscription}
      <div class="rounded-2xl border-2 border-primary/50 bg-primary/5 p-4 space-y-3">
        <label class="text-xs font-medium text-muted-foreground">Review and edit transcription:</label>
        <textarea
          value={pendingTranscription || ''}
          oninput={(e) => onUpdateTranscription(e.currentTarget.value)}
          rows={4}
          class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        ></textarea>
        <div class="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onclick={onCancelTranscription}>Cancel</Button>
          <Button size="sm" onclick={onSendTranscription} disabled={!pendingTranscription?.trim() || isProcessing}>
            <Send class="h-4 w-4 mr-2" />Send to AI
          </Button>
        </div>
      </div>
    {:else}
      <div class={cn("rounded-2xl px-4 py-3", message.role === 'user' ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md")}>
        <p class="text-sm whitespace-pre-wrap">{message.content}</p>
        {#if message.updates?.length}
          <div class="mt-3 pt-3 border-t border-current/10 space-y-1">
            <p class="text-xs opacity-70 font-medium">✅ Updates applied:</p>
            {#each message.updates as update}<div class="flex items-center gap-1.5 text-xs opacity-80"><CheckCircle class="h-3 w-3 shrink-0" /><span>{update}</span></div>{/each}
          </div>
        {/if}
      </div>
    {/if}
    
    {#if message.role === 'assistant' && !message.content.startsWith('👋') && !message.content.startsWith('💬')}
      <div class="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onclick={onCopyMessage} class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" title="Copy"><Copy class="h-3.5 w-3.5" /></button>
        <button onclick={onRetryMessage} class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" title="Retry"><RefreshCw class="h-3.5 w-3.5" /></button>
        <button class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" title="Good"><ThumbsUp class="h-3.5 w-3.5" /></button>
        <button class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" title="Bad"><ThumbsDown class="h-3.5 w-3.5" /></button>
      </div>
    {/if}
    <p class="text-xs text-muted-foreground mt-1 px-1">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
  </div>
</div>


