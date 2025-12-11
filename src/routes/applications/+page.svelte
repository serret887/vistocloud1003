<script lang="ts">
	import { onMount } from 'svelte';
	import { collection, getDocs, query, orderBy, limit, doc, deleteDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui';
	import { Button } from '$lib/components/ui';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui';
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
	import { goto } from '$app/navigation';
	import { FileText, Plus, Calendar, User, Trash2 } from 'lucide-svelte';
	import { debug } from '$lib/debug';
	import { _ } from 'svelte-i18n';
	import { toast } from 'svelte-sonner';
	import { getClientNameFromApp } from '$lib/utils/client';
	import { formatDate } from '$lib/utils/date';
	import CreateApplicationDialog from '$lib/components/application/CreateApplicationDialog.svelte';
	
	let applications = $state<any[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let deleteDialogOpen = $state(false);
	let applicationToDelete = $state<{ id: string; name: string } | null>(null);
	let showCreateDialog = $state(false);
	
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
			error = err instanceof Error ? err.message : $_('applications.failedToLoad');
			debug.error('Failed to load applications:', err);
		} finally {
			isLoading = false;
		}
	}
	
	function openDeleteDialog(appId: string, clientName: string) {
		applicationToDelete = { id: appId, name: clientName };
		deleteDialogOpen = true;
	}

	function openCreateDialog() {
		showCreateDialog = true;
	}

	async function confirmDelete() {
		if (!applicationToDelete) return;

		try {
			const appRef = doc(db, 'applications', applicationToDelete.id);
			await deleteDoc(appRef);
			
			// Remove from local state
			applications = applications.filter(app => app.id !== applicationToDelete!.id);
			
			toast.success($_('toast.applicationDeleted'), {
				description: $_('toast.applicationDeletedDescription')
			});
			
			debug.log('✅ Application deleted:', applicationToDelete.id);
			
			// Close dialog and reset
			deleteDialogOpen = false;
			applicationToDelete = null;
		} catch (error) {
			console.error('Failed to delete application:', error);
			toast.error($_('toast.applicationDeleteFailed'), {
				description: error instanceof Error ? error.message : $_('toast.applicationDeleteFailedDescription')
			});
		}
	}
</script>

<div class="min-h-screen bg-background">
	<div class="container mx-auto px-4 py-8">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-bold">{$_('applications.title')}</h1>
				<p class="text-muted-foreground mt-2">{$_('applications.subtitle')}</p>
			</div>
		</div>
		
		{#if isLoading}
			<Card>
				<CardContent class="py-12">
					<div class="text-center text-muted-foreground">{$_('applications.loading')}</div>
				</CardContent>
			</Card>
		{:else if error}
			<Card>
				<CardContent class="py-12">
					<div class="text-center">
						<div class="text-destructive mb-4">{error}</div>
						<Button onclick={loadApplications} variant="outline">{$_('common.retry')}</Button>
					</div>
				</CardContent>
			</Card>
		{:else if applications.length === 0}
			<Card>
				<CardContent class="py-12">
					<div class="text-center space-y-4">
						<FileText class="h-16 w-16 text-muted-foreground mx-auto" />
						<div>
							<h3 class="font-medium text-lg">{$_('applications.noApplications')}</h3>
							<p class="text-muted-foreground text-sm mt-2">
								{$_('applications.noApplicationsDescription')}
							</p>
						</div>
					<Button onclick={openCreateDialog} class="gap-2">
							<Plus class="h-4 w-4" />
							{$_('applications.createApplication')}
						</Button>
					</div>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardHeader>
					<CardTitle>{$_('applications.allApplications')} ({applications.length})</CardTitle>
					<CardDescription>{$_('applications.allApplicationsDescription')}</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{$_('applications.applicationId')}</TableHead>
									<TableHead>{$_('applications.clientName')}</TableHead>
									<TableHead>{$_('applications.currentStep')}</TableHead>
									<TableHead>{$_('applications.lastUpdated')}</TableHead>
									<TableHead class="text-right">{$_('applications.actions')}</TableHead>
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
												{getClientNameFromApp(app)}
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
											<div class="flex items-center justify-end gap-2">
												<Button 
													variant="ghost" 
													size="sm"
													onclick={(e) => {
														e.stopPropagation();
														goto(`/application/${app.id}`);
													}}
												>
													{$_('common.view')}
												</Button>
												<Button 
													variant="ghost" 
													size="sm"
													class="text-destructive hover:text-destructive hover:bg-destructive/10"
													onclick={(e) => {
														e.stopPropagation();
														openDeleteDialog(app.id, getClientNameFromApp(app));
													}}
													title={$_('applications.deleteTitle')}
												>
													<Trash2 class="h-4 w-4" />
												</Button>
											</div>
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

	<!-- Delete Confirmation Dialog -->
	<AlertDialog bind:open={deleteDialogOpen}>
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>{$_('dialogs.deleteApplication.title')}</AlertDialogTitle>
				<AlertDialogDescription>
					{$_('dialogs.deleteApplication.description')}
					{#if applicationToDelete}
						<div class="mt-4 space-y-1 text-sm">
							<p><strong>{$_('dialogs.deleteApplication.client')}:</strong> {applicationToDelete.name}</p>
							<p><strong>{$_('dialogs.deleteApplication.applicationId')}:</strong> <code class="bg-muted px-1.5 py-0.5 rounded text-xs">{applicationToDelete.id.slice(0, 12)}...</code></p>
						</div>
					{/if}
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel onclick={() => { applicationToDelete = null; }}>
					{$_('dialogs.deleteApplication.cancel')}
				</AlertDialogCancel>
				<AlertDialogAction
					class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					onclick={confirmDelete}
				>
					{$_('dialogs.deleteApplication.confirm')}
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>

	<!-- Create Application Confirmation Dialog -->
	<CreateApplicationDialog bind:open={showCreateDialog} />
</div>



