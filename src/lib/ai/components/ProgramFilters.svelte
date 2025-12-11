<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { selectedPrograms } from '$lib/ai/stores/chat';
	import { programLabels } from '$lib/ai/utils';
	import type { Program } from '$lib/ai/types';

	const programs: Program[] = ['ALL', 'FHA', 'VA', 'CONV', 'USDA', 'NONQM'];

	function toggle(program: Program) {
		selectedPrograms.update((current) => {
			if (program === 'ALL') return ['ALL'];
			const next = current.filter((p) => p !== 'ALL');
			if (next.includes(program)) {
				const trimmed = next.filter((p) => p !== program);
				return trimmed.length ? trimmed : ['ALL'];
			}
			return [...next, program];
		});
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each programs as program}
		{@const active =
			program === 'ALL' ? $selectedPrograms.includes('ALL') : $selectedPrograms.includes(program)}
		<Button variant={active ? 'default' : 'outline'} size="sm" class="rounded-full" onclick={() => toggle(program)}>
			{programLabels[program]}
		</Button>
	{/each}
</div>


