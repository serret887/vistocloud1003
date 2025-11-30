<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, Button } from '$lib/components/ui';
  import { Wand2, Loader2, AlertCircle, Upload, X } from 'lucide-svelte';
  import ClientTabs from '../ClientTabs.svelte';
  import type { ChatMessage } from '$lib/types/voice-assistant';
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { cn } from '$lib/utils';
  import ChatMessageItem from './ChatMessage.svelte';
  import ChatInput from './ChatInput.svelte';
  import { createRecordingState, startRecording, stopRecording } from './audioRecording';
  import { processTextWithAI } from './aiProcessor';
  import { createTranscriptionState, processAudioBlob } from './transcription';
  
  const recordingState = $state(createRecordingState());
  const transcriptionState = $state(createTranscriptionState());
  let isProcessing = $state(false);
  let error = $state<string | null>(null);
  let conversationHistory = $state<any[]>([]);
  let textInput = $state('');
  let chatMessages = $state<ChatMessage[]>([]);
  let chatContainerRef: HTMLDivElement | null = null;
  let isDragging = $state(false);
  let droppedFile = $state<File | null>(null);
  const supportsRecording = $derived(browser && typeof MediaRecorder !== 'undefined');
  
  onMount(() => {
    if (browser && supportsRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
    }
    chatMessages = [{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `👋 Hi! I'm your AI assistant for this mortgage application.
\nYou can:
• **Type** your information in the chat
• **Click the mic** 🎤 to speak
• **Drop an audio file** to transcribe a recording
\nTell me about the borrower and I'll fill the application.`,
      timestamp: new Date()
    }];
  });
  
  onDestroy(() => stopRecording(recordingState));
  
  async function handleStartRecording() {
    await startRecording(recordingState, async (blob) => {
      await handleProcessAudioBlob(blob, 'voice');
    });
    if (recordingState.error) error = recordingState.error;
  }
  
  function handleStopRecording() {
    stopRecording(recordingState);
  }
  
  function toggleRecording() {
    recordingState.isRecording ? handleStopRecording() : handleStartRecording();
  }
  
  async function handleProcessAudioBlob(audioBlob: Blob, source: 'voice' | 'file') {
    const message = await processAudioBlob(
      audioBlob,
      source,
      transcriptionState,
      (text) => {
        transcriptionState.pendingTranscription = text;
      },
      (err) => {
        error = err;
      }
    );
    if (message) {
      chatMessages = [...chatMessages, message];
      await scrollToBottom();
    }
    if (transcriptionState.error) error = transcriptionState.error;
    droppedFile = null;
  }
  
  async function sendTranscriptionToAI(transcriptionText: string) {
    if (!transcriptionText.trim() || isProcessing) return;
    const lastUser = chatMessages[chatMessages.length - 1];
    if (lastUser && lastUser.role === 'user') {
      lastUser.content = transcriptionText;
      chatMessages = [...chatMessages];
    }
    transcriptionState.pendingTranscription = null;
    await handleProcessText(transcriptionText);
  }
  
  async function handleProcessText(text: string) {
    isProcessing = true;
    error = null;
    try {
      const result = await processTextWithAI(text, conversationHistory);
      chatMessages = [...chatMessages, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.summary + (result.nextSteps ? `\n\n${result.nextSteps}` : ''),
        timestamp: new Date(),
        updates: result.updates.map(u => u.description)
      }];
      await scrollToBottom();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to process message';
      chatMessages = [...chatMessages, { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: `❌ Error: ${error}`, 
        timestamp: new Date() 
      }];
    } finally {
      isProcessing = false;
    }
  }
  
  async function sendTextMessage() {
    if (!textInput.trim() || isProcessing) return;
    const msg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: textInput.trim(), timestamp: new Date() };
    chatMessages = [...chatMessages, msg];
    const text = textInput.trim();
    textInput = '';
    await scrollToBottom();
    await handleProcessText(text);
  }
  
  function handleTextInputChange(val: string) { textInput = val; }
  
  function handleDragOver(e: DragEvent) { e.preventDefault(); isDragging = true; }
  function handleDragLeave(e: DragEvent) { e.preventDefault(); isDragging = false; }
  async function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const files = e.dataTransfer?.files;
    if (files?.length) {
      const file = files[0];
      if (file.type.startsWith('audio/')) {
        droppedFile = file;
        await handleProcessAudioBlob(file, 'file');
      } else {
        error = 'Please drop an audio file (MP3, WAV, WebM, etc.)';
      }
    }
  }
  
  function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      droppedFile = file;
      handleProcessAudioBlob(file, 'file');
    } else if (file) {
      error = 'Please select an audio file (MP3, WAV, WebM, etc.)';
    }
  }
  
  function copyMessage(content: string) { navigator.clipboard.writeText(content); }
  async function retryMessage(messageId: string) {
    const idx = chatMessages.findIndex(m => m.id === messageId);
    if (idx > 0) {
      const userMsg = chatMessages[idx - 1];
      if (userMsg.role === 'user') {
        chatMessages = chatMessages.filter(m => m.id !== messageId);
        await handleProcessText(userMsg.content);
      }
    }
  }
  
  async function scrollToBottom() {
    await tick();
    if (chatContainerRef) chatContainerRef.scrollTop = chatContainerRef.scrollHeight;
  }
  
  function clearChat() {
    chatMessages = [{ id: crypto.randomUUID(), role: 'assistant', content: '💬 Chat cleared. How can I help you with the application?', timestamp: new Date() }];
    conversationHistory = [];
    error = null;
  }
</script>

<div class="max-w-4xl mx-auto space-y-4">
  <ClientTabs />
  
  <Card class="flex flex-col h-[600px]">
    <CardHeader class="border-b shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Wand2 class="h-5 w-5 text-primary" />
          <div>
            <CardTitle>AI Application Assistant</CardTitle>
            <CardDescription>Chat, speak, or upload audio to fill your application</CardDescription>
          </div>
        </div>
        {#if chatMessages.length > 1}
          <Button variant="ghost" size="sm" onclick={clearChat} class="text-muted-foreground">Clear</Button>
        {/if}
      </div>
    </CardHeader>

    <div 
      role="region"
      aria-label="Conversation area"
      bind:this={chatContainerRef}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      class={cn("flex-1 overflow-y-auto p-4 space-y-4 relative transition-colors", isDragging && "bg-primary/5 border-2 border-dashed border-primary")}
    >
      {#if isDragging}
        <div class="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div class="text-center space-y-2">
            <Upload class="h-12 w-12 mx-auto text-primary animate-bounce" />
            <p class="text-lg font-medium">Drop audio file here</p>
            <p class="text-sm text-muted-foreground">MP3, WAV, WebM, or other audio formats</p>
          </div>
        </div>
      {/if}

      {#each chatMessages as message, index}
        <ChatMessageItem
          {message}
          isPendingTranscription={message.role === 'user' && !!transcriptionState.pendingTranscription && index === chatMessages.length - 1}
          pendingTranscription={transcriptionState.pendingTranscription}
          {isProcessing}
          onUpdateTranscription={(v) => transcriptionState.pendingTranscription = v}
          onSendTranscription={() => sendTranscriptionToAI(transcriptionState.pendingTranscription || '')}
          onCancelTranscription={() => { transcriptionState.pendingTranscription = null; chatMessages = chatMessages.filter(m => m.id !== message.id); }}
          onCopyMessage={() => navigator.clipboard.writeText(message.content)}
          onRetryMessage={() => {
            const idx = chatMessages.findIndex(m => m.id === message.id);
            if (idx > 0) {
              const userMsg = chatMessages[idx - 1];
              if (userMsg.role === 'user') {
                chatMessages = chatMessages.filter(m => m.id !== message.id);
                handleProcessText(userMsg.content);
              }
            }
          }}
        />
      {/each}

      {#if transcriptionState.isTranscribing}
        <div class="flex justify-end">
          <div class="bg-primary/10 text-primary rounded-2xl rounded-br-md px-4 py-3">
            <div class="flex items-center gap-2 text-sm">
              <Loader2 class="h-4 w-4 animate-spin" />
              <span>Transcribing audio...</span>
            </div>
          </div>
        </div>
      {/if}

      {#if isProcessing}
        <div class="flex justify-start">
          <div class="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 class="h-4 w-4 animate-spin" />
              <span>Processing with AI...</span>
            </div>
          </div>
        </div>
      {/if}

      {#if recordingState.isRecording}
        <div class="flex justify-end">
          <div class="bg-destructive text-destructive-foreground rounded-2xl rounded-br-md px-4 py-3">
            <div class="flex items-center gap-2 text-sm">
              <div class="h-2 w-2 rounded-full bg-current animate-pulse"></div>
              <span>Recording... Click mic to stop</span>
            </div>
          </div>
        </div>
      {/if}

      {#if error}
        <div class="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p class="text-sm text-destructive flex items-center gap-2">
            <AlertCircle class="h-4 w-4 shrink-0" />
            {error}
            <button onclick={() => error = null} class="ml-auto"><X class="h-4 w-4" /></button>
          </p>
        </div>
      {/if}
    </div>

    <ChatInput
      {textInput}
      {isProcessing}
      isRecording={recordingState.isRecording}
      {supportsRecording}
      onTextInputChange={handleTextInputChange}
      onSendMessage={sendTextMessage}
      onToggleRecording={toggleRecording}
      onFileInput={handleFileInput}
    />
  </Card>
</div>
