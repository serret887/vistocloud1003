<script lang="ts">
	import { AlertCircle } from 'lucide-svelte';
	import type { ValidationError } from '$lib/validation/types';
	import { _ } from 'svelte-i18n';
	
	interface Props {
		errors: ValidationError[];
	}
	
	let { errors }: Props = $props();
</script>

{#if errors && errors.length > 0}
	<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-2">
		<div class="flex items-center gap-2 text-destructive font-medium">
			<AlertCircle class="h-5 w-5" />
			<span>{$_('errors.fixFollowingErrors')}</span>
		</div>
		<ul class="list-disc list-inside space-y-1 text-sm text-destructive/90 ml-7">
			{#each errors as error}
				<li>{error.message}</li>
			{/each}
		</ul>
	</div>
{/if}

