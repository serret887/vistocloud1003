<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '$lib/components/ui';
	import { Button } from '$lib/components/ui';
	import { 
		Mic, MicOff, Wand2, Loader2, CheckCircle, AlertCircle, Send, 
		MessageSquare, Copy, RefreshCw, Upload, FileAudio, X, ThumbsUp, ThumbsDown
	} from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	import { applicationStore, activeClientId } from '$lib/stores/application';
	import { executeStoreAction } from '$lib/llm/actionExecutor';
	import { resolveAddressesInActions } from '$lib/llm/addressResolver';
	import { filterDuplicateActions } from '$lib/llm/duplicateFilter';
	import { getCurrentLLMState } from '$lib/llm/storeAdapter';
	import { transcribeAudio, processConversation } from '$lib/services/aiFunctions';
	import type { LLMAction, VoiceUpdate, ChatMessage } from '$lib/types/voice-assistant';
	import type { DynamicIdMap } from '$lib/llm/types';
	import { onMount, onDestroy, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils';

	let isRecording = $state(false);
	let isProcessing = $state(false);
	let error = $state<string | null>(null);
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let conversationHistory = $state<any[]>([]);
	
	// Chat state
	let textInput = $state('');
	let chatMessages = $state<ChatMessage[]>([]);
	let chatContainerRef: HTMLDivElement | null = null;
	
	// Transcription state (for two-step flow)
	let pendingTranscription = $state<string | null>(null);
	let isTranscribing = $state(false);
	
	// File drop state
	let isDragging = $state(false);
	let droppedFile = $state<File | null>(null);

	// Check if browser supports media recording
	const supportsRecording = $derived(browser && typeof MediaRecorder !== 'undefined');

	onMount(() => {
		// Request microphone permission
		if (browser && supportsRecording) {
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then(() => console.log('✅ Microphone access granted'))
				.catch((err) => {
					console.error('❌ Microphone access denied:', err);
				});
		}
		
		// Add welcome message
		chatMessages = [{
			id: crypto.randomUUID(),
			role: 'assistant',
			content: `👋 Hi! I'm your AI assistant for this mortgage application.

You can:
• **Type** your information in the chat
• **Click the mic** 🎤 to speak
• **Drop an audio file** to transcribe a recording

Just tell me about the borrower - their name, address, employment, income, assets, etc. I'll extract the information and fill out the application automatically.

Try something like: "John Smith lives at 123 Main St, New York. He works at Tech Corp making $5000/month"`,
			timestamp: new Date()
		}];
	});

	onDestroy(() => {
		stopRecording();
	});

	// Recording functions
	async function startRecording() {
		if (!supportsRecording) {
			error = 'Voice recording is not supported in this browser';
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			
			const options: MediaRecorderOptions = {
				mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
					? 'audio/webm;codecs=opus' 
					: MediaRecorder.isTypeSupported('audio/webm') 
						? 'audio/webm' 
						: undefined
			};

			mediaRecorder = new MediaRecorder(stream, options);
			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				stream.getTracks().forEach(track => track.stop());
				
				if (audioChunks.length > 0) {
					const audioBlob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' });
					await processAudioBlob(audioBlob, 'voice');
				}
			};

			mediaRecorder.onerror = () => {
				error = 'Recording error occurred';
				isRecording = false;
			};

			mediaRecorder.start();
			isRecording = true;
			error = null;
		} catch (err) {
			error = 'Failed to access microphone. Please check permissions.';
		}
	}

	function stopRecording() {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
			isRecording = false;
		}
	}

	function toggleRecording() {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	}

	// Process audio (from recording or file) - Step 1: Transcribe only
	async function processAudioBlob(audioBlob: Blob, source: 'voice' | 'file') {
		isTranscribing = true;
		error = null;
		pendingTranscription = null;

		// Add user message showing audio processing
		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: 'user',
			content: source === 'voice' ? '🎤 Transcribing voice recording...' : '📁 Transcribing audio file...',
			timestamp: new Date()
		};
		chatMessages = [...chatMessages, userMessage];
		await scrollToBottom();

		try {
			// Transcribe audio using Firebase Function
			const transcription = await transcribeAudio(audioBlob);

			if (!transcription || transcription.trim().length === 0) {
				// Update user message to show error
				userMessage.content = source === 'voice' 
					? '🎤 (No speech detected)' 
					: '📁 (No speech detected in file)';
				chatMessages = [...chatMessages];
				error = 'No speech detected. Please try again.';
				isTranscribing = false;
				return;
			}

			// Store transcription for user to review/edit
			pendingTranscription = transcription;
			
			// Update user message with transcription (editable)
			userMessage.content = transcription;
			chatMessages = [...chatMessages];
			
			// Scroll to show the transcription
			await scrollToBottom();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to transcribe audio';
			
			const errorMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: `❌ Error: ${error}`,
				timestamp: new Date()
			};
			chatMessages = [...chatMessages, errorMessage];
		} finally {
			isTranscribing = false;
			droppedFile = null;
		}
	}

	// Send transcription to AI for processing - Step 2: Process conversation
	async function sendTranscriptionToAI(transcriptionText: string) {
		if (!transcriptionText.trim() || isProcessing) return;

		// Update the user message with the final transcription
		const lastUserMessage = chatMessages[chatMessages.length - 1];
		if (lastUserMessage && lastUserMessage.role === 'user') {
			lastUserMessage.content = transcriptionText;
			chatMessages = [...chatMessages];
		}

		// Clear pending transcription
		pendingTranscription = null;

		// Process with AI
		isProcessing = true;
		error = null;

		try {
			await processWithAI(transcriptionText);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to process message';
			
			const errorMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: `❌ Error: ${error}`,
				timestamp: new Date()
			};
			chatMessages = [...chatMessages, errorMessage];
		} finally {
			isProcessing = false;
		}
	}

	// Process text or transcription with AI using Firebase Function
	async function processWithAI(text: string) {
		try {
			const currentState = getCurrentLLMState();
			// Call Firebase Function instead of direct API
			const response = await processConversation(text, currentState, conversationHistory);

			// Execute actions
			const dynamicIdMap: DynamicIdMap = new Map();
			const newUpdates: VoiceUpdate[] = [];

			const resolvedActions = await resolveAddressesInActions(response.actions);
			const filteredActions = filterDuplicateActions(resolvedActions, applicationStore);

			for (const action of filteredActions) {
				try {
					const update = executeStoreAction(action, applicationStore, dynamicIdMap);
					if (update) {
						newUpdates.push(update);
					}
				} catch (err) {
					console.error('Error executing action:', err, action);
				}
			}

			// Save to Firebase
			if (newUpdates.length > 0) {
				try {
					await applicationStore.saveToFirebase();
				} catch (err) {
					console.error('Failed to save to Firebase:', err);
				}
			}

			// Update conversation history
			conversationHistory.push(
				{ role: 'user', content: text, timestamp: new Date().toISOString() },
				{ role: 'assistant', content: response.summary, updates: newUpdates.map(u => u.description), timestamp: new Date().toISOString() }
			);
			if (conversationHistory.length > 10) {
				conversationHistory = conversationHistory.slice(-10);
			}

			// Add assistant message
			const assistantMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: response.summary + (response.nextSteps ? `\n\n${response.nextSteps}` : ''),
				timestamp: new Date(),
				updates: newUpdates.map(u => u.description)
			};
			chatMessages = [...chatMessages, assistantMessage];
			await scrollToBottom();
		} catch (err) {
			throw err;
		}
	}

	// Send text message
	async function sendTextMessage() {
		if (!textInput.trim() || isProcessing) return;

		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: 'user',
			content: textInput.trim(),
			timestamp: new Date()
		};

		chatMessages = [...chatMessages, userMessage];
		const messageText = textInput.trim();
		textInput = '';
		await scrollToBottom();

		isProcessing = true;
		error = null;

		try {
			await processWithAI(messageText);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to process message';
			
			const errorMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: `❌ Error: ${error}`,
				timestamp: new Date()
			};
			chatMessages = [...chatMessages, errorMessage];
		} finally {
			isProcessing = false;
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendTextMessage();
		}
	}

	// File drop handlers
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('audio/')) {
				droppedFile = file;
				await processAudioBlob(file, 'file');
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
			processAudioBlob(file, 'file');
		} else if (file) {
			error = 'Please select an audio file (MP3, WAV, WebM, etc.)';
		}
	}

	// Message actions
	function copyMessage(content: string) {
		navigator.clipboard.writeText(content);
	}

	async function retryMessage(messageId: string) {
		// Find the message and reprocess
		const messageIndex = chatMessages.findIndex(m => m.id === messageId);
		if (messageIndex > 0) {
			const userMessage = chatMessages[messageIndex - 1];
			if (userMessage.role === 'user') {
				// Remove the assistant message
				chatMessages = chatMessages.filter(m => m.id !== messageId);
				
				isProcessing = true;
				try {
					await processWithAI(userMessage.content);
				} catch (err) {
					error = err instanceof Error ? err.message : 'Failed to retry';
				} finally {
					isProcessing = false;
				}
			}
		}
	}

	async function scrollToBottom() {
		await tick();
		if (chatContainerRef) {
			chatContainerRef.scrollTop = chatContainerRef.scrollHeight;
		}
	}

	function clearChat() {
		chatMessages = [{
			id: crypto.randomUUID(),
			role: 'assistant',
			content: '💬 Chat cleared. How can I help you with the application?',
			timestamp: new Date()
		}];
		conversationHistory = [];
		error = null;
	}
</script>

<div class="max-w-4xl mx-auto space-y-4">
	<ClientTabs />
	
	<!-- Main Chat Card -->
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
					<Button variant="ghost" size="sm" onclick={clearChat} class="text-muted-foreground">
						Clear
					</Button>
				{/if}
			</div>
		</CardHeader>

		<!-- Chat Messages Area with Drop Zone -->
		<div 
			bind:this={chatContainerRef}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			class={cn(
				"flex-1 overflow-y-auto p-4 space-y-4 relative transition-colors",
				isDragging && "bg-primary/5 border-2 border-dashed border-primary"
			)}
		>
			<!-- Drop overlay -->
			{#if isDragging}
				<div class="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
					<div class="text-center space-y-2">
						<Upload class="h-12 w-12 mx-auto text-primary animate-bounce" />
						<p class="text-lg font-medium">Drop audio file here</p>
						<p class="text-sm text-muted-foreground">MP3, WAV, WebM, or other audio formats</p>
					</div>
				</div>
			{/if}

			<!-- Messages -->
			{#each chatMessages as message, index}
				<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
					<div class="max-w-[85%] group">
						{#if message.role === 'user' && pendingTranscription && index === chatMessages.length - 1}
							<!-- Editable transcription with send button -->
							<div class="rounded-2xl border-2 border-primary/50 bg-primary/5 p-4 space-y-3">
								<label class="text-xs font-medium text-muted-foreground">Review and edit transcription:</label>
								<textarea
									bind:value={pendingTranscription}
									rows={4}
									class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									placeholder="Edit the transcription if needed..."
								></textarea>
								<div class="flex items-center justify-end gap-2">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => {
											pendingTranscription = null;
											chatMessages = chatMessages.filter(m => m.id !== message.id);
										}}
									>
										Cancel
									</Button>
									<Button
										size="sm"
										onclick={() => sendTranscriptionToAI(pendingTranscription || '')}
										disabled={!pendingTranscription?.trim() || isProcessing}
									>
										<Send class="h-4 w-4 mr-2" />
										Send to AI
									</Button>
								</div>
							</div>
						{:else}
							<div class={cn(
								"rounded-2xl px-4 py-3",
								message.role === 'user' 
									? "bg-primary text-primary-foreground rounded-br-md" 
									: "bg-muted rounded-bl-md"
							)}>
								<p class="text-sm whitespace-pre-wrap">{message.content}</p>
							
							{#if message.updates && message.updates.length > 0}
								<div class="mt-3 pt-3 border-t border-current/10 space-y-1">
									<p class="text-xs opacity-70 font-medium">✅ Updates applied:</p>
									{#each message.updates as update}
										<div class="flex items-center gap-1.5 text-xs opacity-80">
											<CheckCircle class="h-3 w-3 shrink-0" />
											<span>{update}</span>
										</div>
									{/each}
								</div>
							{/if}
							</div>
						{/if}

						<!-- Message Actions (shadcn.io/ai style) -->
						{#if message.role === 'assistant' && !message.content.startsWith('👋') && !message.content.startsWith('💬')}
							<div class="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onclick={() => copyMessage(message.content)}
									class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
									title="Copy"
								>
									<Copy class="h-3.5 w-3.5" />
								</button>
								<button
									onclick={() => retryMessage(message.id)}
									class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
									title="Retry"
								>
									<RefreshCw class="h-3.5 w-3.5" />
								</button>
								<button
									class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
									title="Good response"
								>
									<ThumbsUp class="h-3.5 w-3.5" />
								</button>
								<button
									class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
									title="Bad response"
								>
									<ThumbsDown class="h-3.5 w-3.5" />
								</button>
							</div>
						{/if}

						<p class="text-xs text-muted-foreground mt-1 px-1">
							{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
						</p>
					</div>
				</div>
			{/each}
			
			<!-- Transcribing indicator -->
			{#if isTranscribing}
				<div class="flex justify-end">
					<div class="bg-primary/10 text-primary rounded-2xl rounded-br-md px-4 py-3">
						<div class="flex items-center gap-2 text-sm">
							<Loader2 class="h-4 w-4 animate-spin" />
							<span>Transcribing audio...</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Processing indicator -->
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

			<!-- Recording indicator -->
			{#if isRecording}
				<div class="flex justify-end">
					<div class="bg-destructive text-destructive-foreground rounded-2xl rounded-br-md px-4 py-3">
						<div class="flex items-center gap-2 text-sm">
							<div class="h-2 w-2 rounded-full bg-current animate-pulse" />
							<span>Recording... Click mic to stop</span>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Error display -->
		{#if error}
			<div class="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
				<p class="text-sm text-destructive flex items-center gap-2">
					<AlertCircle class="h-4 w-4 shrink-0" />
					{error}
					<button onclick={() => error = null} class="ml-auto">
						<X class="h-4 w-4" />
					</button>
				</p>
			</div>
		{/if}

		<!-- Input Area -->
		<div class="border-t p-4 shrink-0">
			<div class="flex items-end gap-2">
				<!-- File upload button -->
				<label class="cursor-pointer">
					<input 
						type="file" 
						accept="audio/*" 
						onchange={handleFileInput}
						class="hidden"
					/>
					<div class="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Upload audio file">
						<FileAudio class="h-5 w-5" />
					</div>
				</label>

				<!-- Text input -->
				<div class="flex-1 relative">
					<textarea
						bind:value={textInput}
						onkeypress={handleKeyPress}
						placeholder="Type a message or click the mic to speak..."
						disabled={isProcessing || isRecording}
						rows={1}
						class="w-full min-h-[44px] max-h-32 resize-none rounded-xl border border-input bg-background px-4 py-3 pr-24 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					></textarea>

					<!-- Mic and Send buttons inside input -->
					<div class="absolute right-2 bottom-2 flex items-center gap-1">
						<!-- Mic button -->
						<button
							onclick={toggleRecording}
							disabled={isProcessing || !supportsRecording}
							class={cn(
								"p-2 rounded-lg transition-all",
								isRecording 
									? "bg-destructive text-destructive-foreground animate-pulse" 
									: "text-muted-foreground hover:text-foreground hover:bg-muted",
								(isProcessing || !supportsRecording) && "opacity-50 cursor-not-allowed"
							)}
							title={isRecording ? "Stop recording" : "Start recording"}
						>
							{#if isRecording}
								<MicOff class="h-5 w-5" />
							{:else}
								<Mic class="h-5 w-5" />
							{/if}
						</button>

						<!-- Send button -->
						<button
							onclick={sendTextMessage}
							disabled={isProcessing || isRecording || !textInput.trim()}
							class={cn(
								"p-2 rounded-lg transition-colors",
								textInput.trim() 
									? "bg-primary text-primary-foreground hover:bg-primary/90" 
									: "text-muted-foreground",
								(isProcessing || isRecording || !textInput.trim()) && "opacity-50 cursor-not-allowed"
							)}
							title="Send message"
						>
							{#if isProcessing}
								<Loader2 class="h-5 w-5 animate-spin" />
							{:else}
								<Send class="h-5 w-5" />
							{/if}
						</button>
					</div>
				</div>
			</div>

			<!-- Helper text -->
			<p class="text-xs text-muted-foreground mt-2 text-center">
				Press Enter to send • Shift+Enter for new line • Drop audio files anywhere
			</p>
		</div>
	</Card>
</div>
