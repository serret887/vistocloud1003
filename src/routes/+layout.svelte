<script lang="ts">
	import '../app.css';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { initFirebaseEmulator } from '$lib/firebase';
	import { initAutoSave, clearAutoSaveTimer } from '$lib/auto-save';
	import { Toaster } from 'svelte-sonner';
	import '$lib/i18n';
	import { _, waitLocale } from 'svelte-i18n';
	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	
	let { children } = $props();
	let ready = $state(false);
	let title = $state('VistoCloud');
	let description = $state('Mortgage Application Platform');
	let unsubscribeAutoSave: (() => void) | undefined;

	// Initialize i18n, Firebase emulator, and auto-save in development
	onMount(async () => {
		await waitLocale();
		title = $_('app.title');
		description = $_('app.description');
		ready = true;
		if (browser) {
			initFirebaseEmulator();
			unsubscribeAutoSave = initAutoSave();
		}
	});

	onDestroy(() => {
		unsubscribeAutoSave?.();
		clearAutoSaveTimer();
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
</svelte:head>

{#if ready}
	<Toaster position="top-right" richColors closeButton />
	<div class="min-h-screen bg-background">
		<AppHeader />
		<main>
			{@render children()}
		</main>
	</div>
{/if}
