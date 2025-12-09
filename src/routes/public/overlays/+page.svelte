<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="max-w-5xl mx-auto px-4 py-10 space-y-8">
	<div>
		<h1 class="text-3xl font-semibold">Public overlays</h1>
		<p class="text-muted-foreground">Visible to everyone without sign-in.</p>
	</div>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Org overlays</h2>
		{#if data.overlays.length === 0}
			<p class="text-sm text-muted-foreground">No public overlays published yet.</p>
		{:else}
			<div class="grid gap-3 md:grid-cols-2">
				{#each data.overlays as o}
					<div class="rounded-lg border p-4 space-y-1 bg-card">
						<p class="text-xs uppercase text-muted-foreground">{o.program}</p>
						<p class="font-semibold">{o.title}</p>
						<p class="text-sm text-muted-foreground">{o.body}</p>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">Lender overlays</h2>
		{#if data.lenderOverlays.length === 0}
			<p class="text-sm text-muted-foreground">No public lender overlays published yet.</p>
		{:else}
			<div class="grid gap-3 md:grid-cols-2">
				{#each data.lenderOverlays as o}
					<div class="rounded-lg border p-4 space-y-1 bg-card">
						<p class="text-xs uppercase text-muted-foreground">{o.program}</p>
						<p class="font-semibold">{o.title}</p>
						<p class="text-sm text-muted-foreground">{o.body}</p>
						{#if o.lenderId}<p class="text-xs text-muted-foreground">Lender: {o.lenderId}</p>{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

