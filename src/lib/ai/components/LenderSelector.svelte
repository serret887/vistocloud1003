<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { Badge, Button } from '$lib/components/ui';
	import { selectedLenderIds } from '$lib/ai/stores/chat';
	import type { Lender } from '$lib/ai/types';

	let lenders: Lender[] = [];
	let show = false;

	onMount(() => {
		if (!browser) return;
		const q = query(collection(db, 'lenders'), where('isActive', '==', true), orderBy('name', 'asc'));
		const unsub = onSnapshot(q, (snap) => {
			lenders = snap.docs.map((d) => ({ ...(d.data() as Lender), id: d.id }));
		});
		const close = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target?.closest('.lender-selector')) show = false;
		};
		document.addEventListener('click', close);
		return () => {
			unsub();
			document.removeEventListener('click', close);
		};
	});

	const toggle = (id: string) =>
		selectedLenderIds.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
</script>

<div class="lender-selector relative">
	<p class="text-xs font-medium text-muted-foreground mb-1.5">Lenders</p>
	<div class="flex flex-wrap items-center gap-2 min-h-[40px] p-2 border rounded-md bg-background">
		{#if !$selectedLenderIds.length}
			<button class="text-sm text-muted-foreground hover:text-foreground" type="button" onclick={() => (show = !show)}>
				Select lenders (optional)...
			</button>
		{:else}
			{#each lenders.filter((l) => $selectedLenderIds.includes(l.id)) as lender}
				<Badge variant="secondary" class="flex items-center gap-1">
					{lender.name}
					<button type="button" class="ml-1 hover:text-destructive" onclick={() => toggle(lender.id)}>✕</button>
				</Badge>
			{/each}
			<button type="button" class="text-xs text-muted-foreground hover:text-foreground" onclick={() => (show = !show)}>+ Add</button>
			<button type="button" class="ml-auto text-xs text-muted-foreground hover:text-destructive" onclick={() => selectedLenderIds.set([])}>
				Clear all
			</button>
		{/if}
	</div>

	{#if show}
		<div class="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-y-auto p-2 space-y-1">
			{#if !lenders.length}
				<div class="p-3 text-sm text-muted-foreground text-center">No lenders configured.</div>
			{:else}
			{#each lenders as lender}
				<button
					type="button"
					class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-muted {$selectedLenderIds.includes(lender.id) ? 'bg-primary/10 text-primary' : ''}"
					onclick={() => toggle(lender.id)}
				>
					<span class="flex items-center gap-2">
						{#if lender.logoUrl}
							<img src={lender.logoUrl} alt="" class="w-5 h-5 rounded" />
						{:else}
							<span class="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs font-medium">
								{lender.name.charAt(0)}
							</span>
						{/if}
						{lender.name}
					</span>
					{#if $selectedLenderIds.includes(lender.id)}<span>✓</span>{/if}
				</button>
			{/each}
			{/if}
		</div>
	{/if}
</div>

