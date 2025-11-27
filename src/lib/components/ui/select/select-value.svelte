<script lang="ts">
	import { cn } from "$lib/utils.js";
	
	interface Props {
		placeholder?: string;
		class?: string;
		value?: string;
	}
	
	let { placeholder = "Select...", class: className, value }: Props = $props();
</script>

<span data-slot="select-value" class={cn("line-clamp-1", className)}>
	{#if value}
		{value}
	{:else}
		<span class="text-muted-foreground">{placeholder}</span>
	{/if}
</span>
