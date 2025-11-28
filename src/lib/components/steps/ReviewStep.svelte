<script lang="ts">
	import { applicationStore, clientIds, activeClientId } from '$lib/stores/application';
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '$lib/components/ui';
	import { Button, Badge } from '$lib/components/ui';
	import { CheckCircle, AlertCircle, Send, Download, FileText, Loader2 } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	import { get } from 'svelte/store';
	import { downloadMISMO, validateMISMO, generateMISMO } from '$lib/mismo';
	
	let store = $derived(get(applicationStore));
	let isSubmitting = $state(false);
	let isExporting = $state(false);
	let validationErrors = $state<string[]>([]);
	let submitSuccess = $state(false);
	
	function getClientData(clientId: string) {
		return store.clientData[clientId];
	}
	
	function getEmploymentCount(clientId: string) {
		return store.employmentData[clientId]?.records?.length || 0;
	}
	
	function getAssetsCount(clientId: string) {
		return store.assetsData[clientId]?.records?.length || 0;
	}
	
	function getIncomeCount(clientId: string) {
		const income = store.incomeData[clientId];
		return (income?.activeIncomeRecords?.length || 0) + (income?.passiveIncomeRecords?.length || 0);
	}
	
	function getRealEstateCount(clientId: string) {
		return store.realEstateData[clientId]?.records?.length || 0;
	}
	
	function isClientComplete(clientId: string) {
		const client = getClientData(clientId);
		const address = store.addressData[clientId]?.present?.addr;
		return client?.firstName && 
			client?.lastName && 
			client?.email && 
			client?.phone && 
			client?.ssn && 
			client?.dob &&
			client?.citizenship &&
			client?.maritalStatus &&
			address?.address1;
	}
	
	function isApplicationComplete() {
		return $clientIds.every(id => isClientComplete(id));
	}
	
	async function handleExportMISMO() {
		isExporting = true;
		validationErrors = [];
		
		try {
			const state = get(applicationStore);
			const validation = validateMISMO(state);
			
			if (!validation.valid) {
				validationErrors = validation.errors;
				isExporting = false;
				return;
			}
			
			downloadMISMO(state, `mismo-${state.currentApplicationId || 'application'}.xml`);
			console.log('✅ MISMO XML exported successfully');
		} catch (error) {
			console.error('Failed to export MISMO:', error);
			validationErrors = ['Failed to generate MISMO XML'];
		} finally {
			isExporting = false;
		}
	}
	
	async function handleSubmit() {
		isSubmitting = true;
		validationErrors = [];
		submitSuccess = false;
		
		try {
			const state = get(applicationStore);
			
			// Validate MISMO before submission
			const validation = validateMISMO(state);
			if (!validation.valid) {
				validationErrors = validation.errors;
				isSubmitting = false;
				return;
			}
			
			// Generate MISMO XML
			const mismoXml = generateMISMO(state);
			console.log('📄 MISMO XML generated for submission');
			
			// Save to Firebase one final time
			await applicationStore.saveToFirebase();
			
			// Here you would typically:
			// 1. Send the MISMO XML to your backend
			// 2. Submit to the LOS (Loan Origination System)
			// 3. Update the application status
			
			// For now, we'll just mark it as submitted
			console.log('✅ Application submitted successfully');
			submitSuccess = true;
			
			// Download the MISMO XML as a record
			downloadMISMO(state, `submitted-${state.currentApplicationId || 'application'}.xml`);
		} catch (error) {
			console.error('Failed to submit application:', error);
			validationErrors = ['Failed to submit application. Please try again.'];
		} finally {
			isSubmitting = false;
		}
	}
	
	function previewMISMO() {
		const state = get(applicationStore);
		const xml = generateMISMO(state);
		
		// Open in new window for preview
		const win = window.open('', '_blank');
		if (win) {
			win.document.write(`<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px;">${xml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
			win.document.title = 'MISMO XML Preview';
		}
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	<!-- Application Summary -->
	<Card>
		<CardHeader>
			<CardTitle>Application Summary</CardTitle>
			<CardDescription>Review all borrower information before submission</CardDescription>
		</CardHeader>
		<CardContent class="space-y-6">
			{#each $clientIds as clientId, idx}
				{@const client = getClientData(clientId)}
				{@const isComplete = isClientComplete(clientId)}
				
				<div class="p-4 rounded-lg border">
					<div class="flex items-center justify-between mb-4">
						<h3 class="font-medium">
							{client?.firstName || 'Client'} {client?.lastName || (idx + 1)}
							<span class="text-sm text-muted-foreground ml-2">
								{idx === 0 ? '(Primary Borrower)' : '(Co-Borrower)'}
							</span>
						</h3>
						{#if isComplete}
							<Badge variant="success" class="gap-1">
								<CheckCircle class="h-3 w-3" />
								Complete
							</Badge>
						{:else}
							<Badge variant="warning" class="gap-1">
								<AlertCircle class="h-3 w-3" />
								Incomplete
							</Badge>
						{/if}
					</div>
					
					<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
						<div>
							<div class="text-muted-foreground">Personal</div>
							<div>{client?.firstName} {client?.lastName}</div>
							<div class="text-xs text-muted-foreground">
								{client?.citizenship || 'No citizenship'}
							</div>
						</div>
						<div>
							<div class="text-muted-foreground">Contact</div>
							<div>{client?.email || 'No email'}</div>
							<div>{client?.phone || 'No phone'}</div>
						</div>
						<div>
							<div class="text-muted-foreground">Employment</div>
							<div>{getEmploymentCount(clientId)} employer(s)</div>
							<div class="text-xs text-muted-foreground">
								{getIncomeCount(clientId)} income source(s)
							</div>
						</div>
						<div>
							<div class="text-muted-foreground">Assets & Property</div>
							<div>{getAssetsCount(clientId)} asset(s)</div>
							<div class="text-xs text-muted-foreground">
								{getRealEstateCount(clientId)} property(s)
							</div>
						</div>
					</div>
				</div>
			{/each}
		</CardContent>
	</Card>

	<!-- Validation Errors -->
	{#if validationErrors.length > 0}
		<Card class="border-destructive">
			<CardHeader>
				<CardTitle class="text-destructive flex items-center gap-2">
					<AlertCircle class="h-5 w-5" />
					Validation Errors
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ul class="space-y-1 text-sm text-destructive">
					{#each validationErrors as error}
						<li class="flex items-start gap-2">
							<AlertCircle class="h-4 w-4 mt-0.5 shrink-0" />
							{error}
						</li>
					{/each}
				</ul>
			</CardContent>
		</Card>
	{/if}

	<!-- Success Message -->
	{#if submitSuccess}
		<Card class="border-success bg-success/5">
			<CardContent class="pt-6">
				<div class="flex items-center gap-3 text-success">
					<CheckCircle class="h-6 w-6" />
					<div>
						<div class="font-medium">Application Submitted Successfully</div>
						<div class="text-sm opacity-80">MISMO XML has been downloaded for your records</div>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- MISMO Export Section -->
	<Card>
		<CardHeader>
			<div class="flex items-center gap-2">
				<FileText class="h-5 w-5 text-primary" />
				<div>
					<CardTitle>MISMO Export</CardTitle>
					<CardDescription>Generate MISMO 3.4 XML for loan registration</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-sm text-muted-foreground">
				MISMO (Mortgage Industry Standards Maintenance Organization) is the standard format 
				for exchanging mortgage application data. Export your application to MISMO 3.4 XML 
				for submission to lenders, LOS systems, or regulatory compliance.
			</p>
			
			<div class="flex flex-wrap gap-3">
				<Button variant="outline" onclick={previewMISMO} class="gap-2">
					<FileText class="h-4 w-4" />
					Preview XML
				</Button>
				<Button variant="outline" onclick={handleExportMISMO} disabled={isExporting} class="gap-2">
					{#if isExporting}
						<Loader2 class="h-4 w-4 animate-spin" />
					{:else}
						<Download class="h-4 w-4" />
					{/if}
					Export MISMO XML
				</Button>
			</div>
		</CardContent>
	</Card>

	<!-- Submit Section -->
	<Card>
		<CardContent class="pt-6">
			<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h3 class="font-medium">Ready to Submit?</h3>
					<p class="text-sm text-muted-foreground">
						{#if isApplicationComplete()}
							All required information is complete. You can submit the application.
						{:else}
							Some required information is missing. Please complete all sections before submitting.
						{/if}
					</p>
				</div>
				<div class="flex gap-3">
					<Button variant="outline" onclick={() => applicationStore.saveToFirebase()}>
						Save Draft
					</Button>
					<Button 
						onclick={handleSubmit} 
						disabled={isSubmitting || !isApplicationComplete()}
						class="gap-2"
					>
						{#if isSubmitting}
							<Loader2 class="h-4 w-4 animate-spin" />
							Submitting...
						{:else}
							<Send class="h-4 w-4" />
							Submit Application
						{/if}
					</Button>
				</div>
			</div>
		</CardContent>
	</Card>
</div>

