<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	const { user, org } = $props<{
		user: { uid: string; name?: string } | null;
		org: { id: string; name?: string } | null;
	}>();
</script>

<div class="flex h-[calc(100vh-4rem)] overflow-hidden bg-muted/30">
	<Sidebar {user} {org} />
	<div class="flex-1 min-w-0 flex flex-col bg-background">
		<main class="flex-1 overflow-y-auto">
			<slot />
		</main>
	</div>
</div>

