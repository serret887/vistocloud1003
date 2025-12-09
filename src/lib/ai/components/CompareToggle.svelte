<script lang="ts">
	import { compareMode } from '$lib/ai/stores/chat';
	import { Label, Switch } from '$lib/components/ui';
</script>

<div class="flex items-center gap-2">
	<Switch bind:checked={$compareMode} aria-label="Toggle compare" />
	<Label class="text-sm text-muted-foreground">Compare programs</Label>
</div>

