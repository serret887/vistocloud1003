<script lang="ts">
	import { cn } from "$lib/utils";

	let {
		class: className,
		children,
		...restProps
	}: { class?: string; children?: import("svelte").Snippet } = $props();
</script>

<div
	class={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>

