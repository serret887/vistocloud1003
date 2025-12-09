<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui';
	import { compareMode, isSendingMessage, selectedConversationId, selectedLenderIds, selectedPrograms } from '$lib/ai/stores/chat';
	import type { Program } from '$lib/ai/types';

	export let initialQuestion = '';
	let question = initialQuestion;
	let baseText = '';
	let isRecording = false;
	let recognition: SpeechRecognitionType | null = null;

	type SpeechRecognitionType = {
		start: () => void;
		stop: () => void;
		onresult?: (e: any) => void;
		onend?: () => void;
		continuous: boolean;
		interimResults: boolean;
		lang: string;
	};

	if (browser && (window as any).webkitSpeechRecognition) {
		const C = (window as any).webkitSpeechRecognition;
		recognition = new C() as SpeechRecognitionType;
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = 'en-US';
		recognition.onresult = (e: any) => {
			let interim = '';
			let final = '';
			for (let i = e.resultIndex; i < e.results.length; i++) {
				const t = e.results[i][0].transcript;
				e.results[i].isFinal ? (final += `${t} `) : (interim += t);
			}
			if (final) baseText = `${baseText} ${final}`.trim();
			question = `${baseText} ${interim}`.trim();
		};
		recognition.onend = () => (isRecording = false);
	}

	const toggleMic = () => {
		if (!recognition) return;
		isRecording ? recognition.stop() : (baseText = question.trim(), recognition.start());
		isRecording = !isRecording;
	};

	const handleSend = async () => {
		if (!question.trim()) return;
		isSendingMessage.set(true);
		try {
			const res = await fetch('/api/ai/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					question: question.trim(),
					conversationId: $selectedConversationId || undefined,
					programs: $selectedPrograms as Program[],
					lenderIds: $selectedLenderIds,
					mode: $compareMode ? 'compare' : 'single'
				})
			});
			const data = await res.json();
			selectedConversationId.set(data.conversationId);
			if (data.conversationId) goto(`/ai/app/${data.conversationId}`, { replaceState: true });
			question = '';
			baseText = '';
		} catch (e) {
			console.error(e);
		} finally {
			isSendingMessage.set(false);
		}
	};

	const onKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};
</script>

<form class="space-y-2" on:submit|preventDefault={handleSend}>
	<div class="relative flex items-end gap-2">
		<textarea
			bind:value={question}
			on:keydown={onKey}
			placeholder="Ask about guidelines, overlays, or compare lenders…"
			disabled={$isSendingMessage || isRecording}
			rows="2"
			class="w-full min-h-[64px] pr-12 rounded-md border bg-background p-3 text-sm"
		></textarea>
		<Button type="button" variant="ghost" class="absolute right-2 bottom-2 h-9 w-9 p-0" onclick={toggleMic} disabled={!recognition}>
			{isRecording ? '⏹' : '🎙️'}
		</Button>
	</div>
	<div class="flex justify-between text-xs text-muted-foreground">
		<span>{isRecording ? 'Recording… click to stop' : 'Enter to send, Shift+Enter for newline'}</span>
		<Button type="submit" size="sm" disabled={$isSendingMessage || !question.trim()}>Send</Button>
	</div>
</form>

