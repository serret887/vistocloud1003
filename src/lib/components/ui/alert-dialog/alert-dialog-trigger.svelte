<script lang="ts">
	import { AlertDialog } from "bits-ui";
	import { cn } from "$lib/utils";
	import type { AlertDialogTriggerProps } from "bits-ui";

	type Props = AlertDialogTriggerProps & {
		children?: import("svelte").Snippet;
	};

	let {
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<AlertDialog.Trigger
	class={cn("", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</AlertDialog.Trigger>

