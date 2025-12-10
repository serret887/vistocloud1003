<script lang="ts">
	import { AlertDialog } from "bits-ui";
	import { cn } from "$lib/utils";
	import type { AlertDialogRootProps } from "bits-ui";

	type Props = AlertDialogRootProps & {
		children?: import("svelte").Snippet;
	};

	let {
		open = $bindable(false),
		children,
		...restProps
	}: Props = $props();
</script>

<AlertDialog.Root bind:open {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</AlertDialog.Root>

