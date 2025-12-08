<script lang="ts">
	import '../app.css';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { initFirebaseEmulator } from '$lib/firebase';
	import { initAutoSave, clearAutoSaveTimer } from '$lib/auto-save';
	import { Toaster } from 'svelte-sonner';
	import '$lib/i18n';
	import { _ } from 'svelte-i18n';
	
	let { children } = $props();
	
	let unsubscribeAutoSave: (() => void) | undefined;
	
	// Initialize Firebase emulator and auto-save in development
	onMount(() => {
		if (browser) {
			initFirebaseEmulator();
			unsubscribeAutoSave = initAutoSave();
		}
	});
	
	onDestroy(() => {
		if (unsubscribeAutoSave) {
			unsubscribeAutoSave();
		}
		clearAutoSaveTimer();
	});
</script>

<svelte:head>
	<title>{$_('app.title')}</title>
	<meta name="description" content={$_('app.description')} />
</svelte:head>

<Toaster position="top-right" richColors closeButton />
{@render children()}
