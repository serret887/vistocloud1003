<script lang="ts">
  import { Mic, MicOff, Send, FileAudio, Loader2 } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  
  interface Props {
    textInput: string;
    isProcessing: boolean;
    isRecording: boolean;
    supportsRecording: boolean;
    onTextInputChange: (value: string) => void;
    onSendMessage: () => void;
    onToggleRecording: () => void;
    onFileInput: (e: Event) => void;
  }
  
  let { textInput, isProcessing, isRecording, supportsRecording, onTextInputChange, onSendMessage, onToggleRecording, onFileInput }: Props = $props();
  
  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSendMessage(); }
  }
</script>

<div class="border-t p-4 shrink-0">
  <div class="flex items-end gap-2">
    <label class="cursor-pointer">
      <input type="file" accept="audio/*" onchange={onFileInput} class="hidden" />
      <div class="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Upload audio file"><FileAudio class="h-5 w-5" /></div>
    </label>
    
    <div class="flex-1 relative">
      <textarea
        value={textInput}
        oninput={(e) => onTextInputChange(e.currentTarget.value)}
        onkeypress={handleKeyPress}
        placeholder="Type a message or click the mic to speak..."
        disabled={isProcessing || isRecording}
        rows={1}
        class="w-full min-h-[44px] max-h-32 resize-none rounded-xl border border-input bg-background px-4 py-3 pr-24 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      ></textarea>
      
      <div class="absolute right-2 bottom-2 flex items-center gap-1">
        <button onclick={onToggleRecording} disabled={isProcessing || !supportsRecording} class={cn("p-2 rounded-lg transition-all", isRecording ? "bg-destructive text-destructive-foreground animate-pulse" : "text-muted-foreground hover:text-foreground hover:bg-muted", (isProcessing || !supportsRecording) && "opacity-50 cursor-not-allowed")} title={isRecording ? "Stop recording" : "Start recording"}>
          {#if isRecording}<MicOff class="h-5 w-5" />{:else}<Mic class="h-5 w-5" />{/if}
        </button>
        <button onclick={onSendMessage} disabled={isProcessing || isRecording || !textInput.trim()} class={cn("p-2 rounded-lg transition-colors", textInput.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground", (isProcessing || isRecording || !textInput.trim()) && "opacity-50 cursor-not-allowed")} title="Send message">
          {#if isProcessing}<Loader2 class="h-5 w-5 animate-spin" />{:else}<Send class="h-5 w-5" />{/if}
        </button>
      </div>
    </div>
  </div>
  <p class="text-xs text-muted-foreground mt-2 text-center">Press Enter to send • Shift+Enter for new line • Drop audio files anywhere</p>
</div>


