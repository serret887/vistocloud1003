<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { initFirebaseEmulator } from '$lib/firebase';
	
	let { children } = $props();
	
	// Initialize Firebase emulator in development
	onMount(() => {
		if (browser) {
			initFirebaseEmulator();
		}
	});
</script>

<svelte:head>
	<title>VistoCloud - Mortgage Application Platform</title>
	<meta name="description" content="Modern mortgage application processing platform" />
</svelte:head>

{@render children()}
