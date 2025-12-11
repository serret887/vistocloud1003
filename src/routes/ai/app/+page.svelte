<script lang="ts">
	import ChatMessages from '$lib/ai/components/ChatMessages.svelte';
	import ChatInput from '$lib/ai/components/ChatInput.svelte';
	import CompareToggle from '$lib/ai/components/CompareToggle.svelte';
	import ProgramFilters from '$lib/ai/components/ProgramFilters.svelte';
	import LenderSelector from '$lib/ai/components/LenderSelector.svelte';
	import { selectedConversationId } from '$lib/ai/stores/chat';
	import type { PageData } from './$types';

	export let data: PageData;
	const prefill = data.prefill || '';
	$: selectedConversationId.set(null);
</script>

<div class="flex flex-col h-[calc(100vh-80px)]">
	<header class="flex-shrink-0 p-6 pb-4 border-b bg-background space-y-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h1 class="text-2xl font-semibold">Guideline Copilot</h1>
				<p class="text-sm text-muted-foreground">Overlay-aware answers with citations and lender compare.</p>
			</div>
			<CompareToggle />
		</div>
		<div class="flex flex-wrap items-start gap-4">
			<div class="flex-1 min-w-[200px]"><ProgramFilters /></div>
			<div class="flex-1 min-w-[200px]"><LenderSelector /></div>
		</div>
	</header>

	<div class="flex-1 overflow-y-auto"><ChatMessages /></div>

	<footer class="flex-shrink-0 px-4 py-3 border-t bg-background">
		<div class="max-w-3xl mx-auto"><ChatInput initialQuestion={prefill} /></div>
	</footer>
</div>


