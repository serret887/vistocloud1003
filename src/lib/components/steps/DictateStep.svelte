<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
	import { Button } from '$lib/components/ui';
	import { Mic, MicOff, Wand2 } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	
	let isRecording = $state(false);
	let transcript = $state('');
	
	function toggleRecording() {
		isRecording = !isRecording;
		if (isRecording) {
			// Start recording logic would go here
			transcript = '';
		} else {
			// Stop recording logic would go here
		}
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
			<div class="text-center space-y-4 py-8">
				<p class="text-muted-foreground max-w-md mx-auto">
					Use voice dictation to quickly fill out the application. 
					Our AI will extract and organize the information automatically.
				</p>
				
				<button
					onclick={toggleRecording}
					class="h-24 w-24 rounded-full mx-auto flex items-center justify-center transition-all {isRecording 
						? 'bg-destructive text-destructive-foreground animate-pulse' 
						: 'bg-primary text-primary-foreground hover:bg-primary/90'}"
				>
					{#if isRecording}
						<MicOff class="h-10 w-10" />
					{:else}
						<Mic class="h-10 w-10" />
					{/if}
				</button>
				
				<p class="text-sm font-medium">
					{isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
				</p>
			</div>
			
			{#if transcript}
				<div class="p-4 rounded-lg bg-muted/50">
					<h4 class="font-medium mb-2">Transcript</h4>
					<p class="text-sm text-muted-foreground">{transcript}</p>
				</div>
			{/if}
			
			<div class="p-4 rounded-lg border bg-card">
				<h4 class="font-medium mb-2">Tips for best results:</h4>
				<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
					<li>Speak clearly and at a moderate pace</li>
					<li>Include client names when providing their information</li>
					<li>Mention dates, amounts, and specific details</li>
					<li>Say "new employer" or "another asset" to add records</li>
				</ul>
			</div>
		</CardContent>
	</Card>
</div>

