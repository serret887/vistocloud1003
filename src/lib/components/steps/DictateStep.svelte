<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
	import { Button } from '$lib/components/ui';
	import { Mic, MicOff, Wand2, Loader2, CheckCircle, AlertCircle } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	import { applicationStore, activeClientId } from '$lib/stores/application';
	import { processWithGemini } from '$lib/llm/geminiProcessor';
	import { executeStoreAction } from '$lib/llm/actionExecutor';
	import { resolveAddressesInActions } from '$lib/llm/addressResolver';
	import { filterDuplicateActions } from '$lib/llm/duplicateFilter';
	import { getCurrentLLMState } from '$lib/llm/storeAdapter';
	import { recordAudio, transcribeAudio } from '$lib/services/speech-to-text';
	import type { LLMAction, VoiceUpdate } from '$lib/types/voice-assistant';
	import type { DynamicIdMap } from '$lib/llm/types';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let isRecording = $state(false);
	let transcript = $state('');
	let isProcessing = $state(false);
	let error = $state<string | null>(null);
	let updates = $state<VoiceUpdate[]>([]);
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let conversationHistory = $state<any[]>([]);

	// Check if browser supports media recording
	const supportsRecording = $derived(browser && typeof MediaRecorder !== 'undefined');

	onMount(() => {
		// Check for microphone permission
		if (browser && supportsRecording) {
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then(() => {
					console.log('✅ Microphone access granted');
				})
				.catch((err) => {
					console.error('❌ Microphone access denied:', err);
					error = 'Microphone access is required for voice dictation';
				});
		}
	});

	onDestroy(() => {
		stopRecording();
	});

	async function startRecording() {
		if (!supportsRecording) {
			error = 'Voice recording is not supported in this browser';
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			
			// Try to use WebM with Opus codec, fallback to default
			const options: MediaRecorderOptions = {
				mimeType: 'audio/webm;codecs=opus'
			};
			
			// Check if the codec is supported
			if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
				options.mimeType = 'audio/webm';
			}
			
			if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
				options.mimeType = undefined; // Use browser default
			}

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
					await processRecording(audioBlob);
				}
			};

			mediaRecorder.onerror = (event) => {
				console.error('MediaRecorder error:', event);
				error = 'Recording error occurred';
				isRecording = false;
			};

			mediaRecorder.start();
			isRecording = true;
			error = null;
			transcript = '';
			console.log('🎤 Started recording');
		} catch (err) {
			console.error('Failed to start recording:', err);
			error = 'Failed to access microphone. Please check permissions.';
		}
	}

	function stopRecording() {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
			isRecording = false;
			console.log('🛑 Stopped recording');
		}
	}

	async function processRecording(audioBlob: Blob) {
		isProcessing = true;
		error = null;
		transcript = '';

		try {
			console.log('📝 Transcribing audio...');
			// Transcribe audio
			const transcription = await transcribeAudio(audioBlob);
			transcript = transcription;

			if (!transcription || transcription.trim().length === 0) {
				error = 'No speech detected. Please try again.';
				isProcessing = false;
				return;
			}

			console.log('🤖 Processing with Gemini...');
			// Get current state
			const currentState = getCurrentLLMState();

			// Process with Gemini
			const response = await processWithGemini(transcription, currentState, conversationHistory);

			console.log('✅ Processing complete, executing actions...');
			// Execute actions
			const dynamicIdMap: DynamicIdMap = new Map();
			const newUpdates: VoiceUpdate[] = [];

			// Resolve addresses first
			const resolvedActions = await resolveAddressesInActions(response.actions);

			// Filter duplicates
			const filteredActions = filterDuplicateActions(resolvedActions, applicationStore);

			// Execute each action
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

			// Save to Firebase after processing
			if (newUpdates.length > 0) {
				try {
					await applicationStore.saveToFirebase();
					console.log('✅ Changes saved to Firebase');
				} catch (err) {
					console.error('Failed to save to Firebase:', err);
				}
			}

			// Update conversation history
			conversationHistory.push({
				role: 'user',
				content: transcription,
				timestamp: new Date().toISOString()
			});

			conversationHistory.push({
				role: 'assistant',
				content: response.summary,
				updates: newUpdates.map(u => u.description),
				timestamp: new Date().toISOString()
			});

			// Keep only last 10 messages
			if (conversationHistory.length > 10) {
				conversationHistory = conversationHistory.slice(-10);
			}

			updates = [...updates, ...newUpdates];
			isProcessing = false;

			console.log('✅ Voice dictation processing complete');
		} catch (err) {
			console.error('Error processing recording:', err);
			error = err instanceof Error ? err.message : 'Failed to process recording';
			isProcessing = false;
		}
	}

	function toggleRecording() {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	}

	function clearTranscript() {
		transcript = '';
		error = null;
		updates = [];
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	<Card>
		<CardHeader>
			<div class="flex items-center gap-2">
				<Wand2 class="h-5 w-5 text-primary" />
				<CardTitle>Voice Assistant</CardTitle>
			</div>
		</CardHeader>
		<CardContent class="space-y-6">
			{#if !supportsRecording}
				<div class="p-4 rounded-lg bg-warning/10 border border-warning/20">
					<p class="text-sm text-warning flex items-center gap-2">
						<AlertCircle class="h-4 w-4" />
						Voice recording is not supported in this browser.
					</p>
				</div>
			{/if}

			<div class="text-center space-y-4 py-8">
				<p class="text-muted-foreground max-w-md mx-auto">
					Use voice dictation to quickly fill out the application. 
					Our AI will extract and organize the information automatically.
				</p>
				
				<button
					onclick={toggleRecording}
					disabled={isProcessing || !supportsRecording}
					class="h-24 w-24 rounded-full mx-auto flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed {isRecording 
						? 'bg-destructive text-destructive-foreground animate-pulse' 
						: isProcessing
							? 'bg-muted text-muted-foreground'
							: 'bg-primary text-primary-foreground hover:bg-primary/90'}"
				>
					{#if isProcessing}
						<Loader2 class="h-10 w-10 animate-spin" />
					{:else if isRecording}
						<MicOff class="h-10 w-10" />
					{:else}
						<Mic class="h-10 w-10" />
					{/if}
				</button>
				
				<p class="text-sm font-medium">
					{#if isProcessing}
						Processing your voice...
					{:else if isRecording}
						Recording... Click to stop
					{:else}
						Click to start recording
					{/if}
				</p>
			</div>

			{#if error}
				<div class="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
					<p class="text-sm text-destructive flex items-center gap-2">
						<AlertCircle class="h-4 w-4" />
						{error}
					</p>
				</div>
			{/if}
			
			{#if transcript}
				<div class="p-4 rounded-lg bg-muted/50">
					<div class="flex items-center justify-between mb-2">
						<h4 class="font-medium">Transcript</h4>
						<Button variant="ghost" size="sm" onclick={clearTranscript}>Clear</Button>
					</div>
					<p class="text-sm text-muted-foreground whitespace-pre-wrap">{transcript}</p>
				</div>
			{/if}

			{#if updates.length > 0}
				<div class="p-4 rounded-lg border bg-card">
					<h4 class="font-medium mb-3">Updates Applied</h4>
					<div class="space-y-2">
						{#each updates as update}
							<div class="flex items-start gap-2 text-sm">
								<CheckCircle class="h-4 w-4 text-success mt-0.5 shrink-0" />
								<div>
									<div class="font-medium">{update.description}</div>
									{#if update.clientName}
										<div class="text-muted-foreground text-xs">Client: {update.clientName}</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			
			<div class="p-4 rounded-lg border bg-card">
				<h4 class="font-medium mb-2">Tips for best results:</h4>
				<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
					<li>Speak clearly and at a moderate pace</li>
					<li>Include client names when providing their information</li>
					<li>Mention dates, amounts, and specific details</li>
					<li>Say "new employer" or "another asset" to add records</li>
					<li>Example: "John Smith lives at 123 Main Street, New York. He works at Tech Corp and makes $5000 per month."</li>
				</ul>
			</div>
		</CardContent>
	</Card>
</div>
