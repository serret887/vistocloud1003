<script lang="ts">
	import { AlertDialog } from "bits-ui";
	import { cn } from "$lib/utils";
	import { buttonVariants } from "../button/index.js";
	import type { AlertDialogActionProps } from "bits-ui";

	type Props = AlertDialogActionProps & {
		children?: import("svelte").Snippet;
	};

	let {
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<AlertDialog.Action
	class={cn(buttonVariants(), className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</AlertDialog.Action>

