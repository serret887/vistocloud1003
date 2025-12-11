<!--
	Reusable Create Application Dialog Component
	Handles the dialog UI and delegates to the createNewApplication utility
-->
<script lang="ts">
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui';
	import { createNewApplication } from '$lib/utils/application';
	import { _ } from 'svelte-i18n';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let { open = $bindable(false), onOpenChange }: Props = $props();

	async function handleCreate() {
		open = false;
		onOpenChange?.(false);
		await createNewApplication();
	}

	function handleCancel() {
		open = false;
		onOpenChange?.(false);
	}
</script>

<AlertDialog bind:open>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>{$_('dialogs.createApplication.title')}</AlertDialogTitle>
			<AlertDialogDescription>
				{$_('dialogs.createApplication.description')}
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel onclick={handleCancel}>
				{$_('dialogs.createApplication.cancel')}
			</AlertDialogCancel>
			<AlertDialogAction onclick={handleCreate}>
				{$_('dialogs.createApplication.confirm')}
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
