<script lang="ts">
	import { AlertDialog } from "bits-ui";
	import { cn } from "$lib/utils";
	import type { AlertDialogDescriptionProps } from "bits-ui";

	type Props = AlertDialogDescriptionProps & {
		children?: import("svelte").Snippet;
	};

	let {
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<AlertDialog.Description
	class={cn("text-sm text-muted-foreground", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</AlertDialog.Description>

