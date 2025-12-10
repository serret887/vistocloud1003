<script lang="ts">
	import { AlertDialog } from "bits-ui";
	import { cn } from "$lib/utils";
	import { buttonVariants } from "../button/index.js";
	import type { AlertDialogCancelProps } from "bits-ui";

	type Props = AlertDialogCancelProps & {
		children?: import("svelte").Snippet;
	};

	let {
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<AlertDialog.Cancel
	class={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</AlertDialog.Cancel>

