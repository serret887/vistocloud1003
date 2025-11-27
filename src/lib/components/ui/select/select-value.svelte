<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		placeholder?: string;
		class?: string;
		children?: Snippet;
	}
	
	let { placeholder = 'Select...', class: className, children }: Props = $props();
</script>

<span data-slot="select-value" class={className}>
	{#if children}
		{@render children()}
	{:else}
		{placeholder}
	{/if}
</span>

