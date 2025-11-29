<script lang="ts">
	import { onMount } from 'svelte';
	import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui';
	import { Button } from '$lib/components/ui';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { FileText, Plus, Calendar, User } from 'lucide-svelte';
	import { debug } from '$lib/debug';
	
	let applications = $state<any[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	
	onMount(async () => {
		await loadApplications();
	});
	
	async function loadApplications() {
		isLoading = true;
		error = null;
		
		try {
			debug.group('Loading applications');
			const appsRef = collection(db, 'applications');
			const q = query(appsRef, orderBy('updatedAt', 'desc'), limit(100));
			const snapshot = await getDocs(q);
			
			applications = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
			
			debug.log(`Loaded ${applications.length} applications`);
			debug.groupEnd();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load applications';
			debug.error('Failed to load applications:', err);
		} finally {
			isLoading = false;
		}
	}
	
	function formatDate(date: any): string {
		if (!date) return 'N/A';
		if (date.toDate) {
			return date.toDate().toLocaleDateString();
		}
		if (typeof date === 'string') {
			return new Date(date).toLocaleDateString();
		}
		return 'N/A';
	}
	
	function getClientName(app: any): string {
		const clientData = app.clientData || {};
		const firstClientId = Object.keys(clientData)[0];
		const client = clientData[firstClientId];
		if (client?.firstName && client?.lastName) {
			return `${client.firstName} ${client.lastName}`;
		}
		return 'Unnamed Application';
	}
</script>

<div class="min-h-screen bg-background">
	<div class="container mx-auto px-4 py-8">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-bold">Applications</h1>
				<p class="text-muted-foreground mt-2">View and manage all mortgage applications</p>
			</div>
			<Button onclick={() => goto('/')} class="gap-2">
				<Plus class="h-5 w-5" />
				New Application
			</Button>
		</div>
		
		{#if isLoading}
			<Card>
				<CardContent class="py-12">
					<div class="text-center text-muted-foreground">Loading applications...</div>
				</CardContent>
			</Card>
		{:else if error}
			<Card>
				<CardContent class="py-12">
					<div class="text-center">
						<div class="text-destructive mb-4">{error}</div>
						<Button onclick={loadApplications} variant="outline">Retry</Button>
					</div>
				</CardContent>
			</Card>
		{:else if applications.length === 0}
			<Card>
				<CardContent class="py-12">
					<div class="text-center space-y-4">
						<FileText class="h-16 w-16 text-muted-foreground mx-auto" />
						<div>
							<h3 class="font-medium text-lg">No Applications Found</h3>
							<p class="text-muted-foreground text-sm mt-2">
								Create your first application to get started
							</p>
						</div>
						<Button onclick={() => goto('/')} class="gap-2">
							<Plus class="h-4 w-4" />
							Create Application
						</Button>
					</div>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardHeader>
					<CardTitle>All Applications ({applications.length})</CardTitle>
					<CardDescription>Click on an application to view or edit</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Application ID</TableHead>
									<TableHead>Client Name</TableHead>
									<TableHead>Current Step</TableHead>
									<TableHead>Last Updated</TableHead>
									<TableHead class="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each applications as app}
									<TableRow 
										class="cursor-pointer hover:bg-muted/50"
										onclick={() => goto(`/application/${app.id}`)}
									>
										<TableCell>
											<code class="text-xs bg-muted px-2 py-1 rounded">
												{app.id.slice(0, 12)}...
											</code>
										</TableCell>
										<TableCell>
											<div class="flex items-center gap-2">
												<User class="h-4 w-4 text-muted-foreground" />
												{getClientName(app)}
											</div>
										</TableCell>
										<TableCell>
											<span class="text-sm capitalize">
												{app.currentStepId || 'client-info'}
											</span>
										</TableCell>
										<TableCell>
											<div class="flex items-center gap-2 text-sm text-muted-foreground">
												<Calendar class="h-4 w-4" />
												{formatDate(app.updatedAt)}
											</div>
										</TableCell>
										<TableCell class="text-right">
											<Button 
												variant="ghost" 
												size="sm"
												onclick={(e) => {
													e.stopPropagation();
													goto(`/application/${app.id}`);
												}}
											>
												View
											</Button>
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>


