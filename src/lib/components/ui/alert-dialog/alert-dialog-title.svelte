<script lang="ts">
	import { AlertDialog } from "bits-ui";
	import { cn } from "$lib/utils";
	import type { AlertDialogTitleProps } from "bits-ui";

	type Props = AlertDialogTitleProps & {
		children?: import("svelte").Snippet;
	};

	let {
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<AlertDialog.Title
	class={cn("text-lg font-semibold", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</AlertDialog.Title>

