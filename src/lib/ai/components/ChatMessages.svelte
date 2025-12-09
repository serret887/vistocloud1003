<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { browser } from '$app/environment';
	import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { isSendingMessage, selectedConversationId } from '$lib/ai/stores/chat';
	import type { Message } from '$lib/ai/types';

	let messages: Message[] = [];
	let box: HTMLDivElement;

	afterUpdate(() => box && (box.scrollTop = box.scrollHeight));

	onMount(() => {
		if (!browser) return;
		let unsub = () => {};
		const stop = selectedConversationId.subscribe((id) => {
			unsub();
			messages = [];
			if (!id) return;
			const q = query(collection(db, 'messages'), where('conversationId', '==', id), orderBy('createdAt', 'asc'));
			unsub = onSnapshot(q, (snap) => {
				messages = snap.docs.map((d) => {
					const data = d.data() as any;
					return { ...data, id: d.id, createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date() };
				});
			});
		});
		return () => {
			unsub();
			stop();
		};
	});
</script>

<div bind:this={box} class="h-full overflow-y-auto p-4 space-y-3">
	{#if !messages.length && !$isSendingMessage}
		<div class="text-sm text-muted-foreground text-center py-12">Start a conversation to see cited answers.</div>
	{/if}
	{#each messages as message (message.id)}
		<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
			<div class="max-w-3xl rounded-2xl px-4 py-3 text-sm shadow {message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}">
				<div class="whitespace-pre-wrap leading-relaxed">{message.content}</div>
				{#if message.citations?.length}
					<div class="mt-3 pt-3 border-t border-border/60 space-y-1">
						{#each message.citations as cite}
							<p class="text-xs text-muted-foreground flex gap-2 items-center">
								<span>📎</span><span>{cite.sourceName} §{cite.section}</span>
								{#if cite.url}<a class="text-primary underline" href={cite.url} target="_blank">link</a>{/if}
							</p>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/each}
	{#if $isSendingMessage}
		<div class="flex justify-start">
			<div class="rounded-2xl px-4 py-3 shadow bg-muted text-sm text-muted-foreground">Analyzing guidelines…</div>
		</div>
	{/if}
</div>

