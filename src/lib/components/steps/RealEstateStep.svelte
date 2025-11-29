<script lang="ts">
	import { applicationStore, activeClientId, activeRealEstateData } from '$lib/stores/application';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui';
	import { Input, Label, Switch, Button } from '$lib/components/ui';
	import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '$lib/components/ui';
	import { ValidatedSelect } from '$lib/components/ui/validated-input';
	import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
	import { Plus, Trash2, Home, DollarSign, Building2 } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, OCCUPANCY_TYPE_LABELS } from '$lib/types/real-estate';
	import type { AddressType } from '$lib/types/address';
	
	const propertyTypes = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label }));
	const propertyStatuses = Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => ({ value, label }));
	const occupancyTypes = Object.entries(OCCUPANCY_TYPE_LABELS).map(([value, label]) => ({ value, label }));
	
	function addProperty() {
		applicationStore.addRealEstateRecord($activeClientId);
	}
	
	function updateProperty(recordId: string, field: string, value: string | number | boolean | AddressType) {
		applicationStore.updateRealEstateRecord($activeClientId, recordId, { [field]: value });
	}
	
	function removeProperty(recordId: string) {
		applicationStore.removeRealEstateRecord($activeClientId, recordId);
	}
	
	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
	}
	
	// Calculate totals
	let totalPropertyValue = $derived(
		($activeRealEstateData?.records || []).reduce((sum, rec) => sum + (rec.propertyValue || 0), 0)
	);
	
	let totalMonthlyExpenses = $derived(
		($activeRealEstateData?.records || []).reduce((sum, rec) => 
			sum + (rec.monthlyTaxes || 0) + (rec.monthlyInsurance || 0), 0)
	);
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	<!-- Real Estate Summary Card -->
	{#if ($activeRealEstateData?.records?.length || 0) > 0}
		<Card class="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
			<CardContent class="py-6">
				<div class="grid md:grid-cols-3 gap-6 text-center">
					<div>
						<p class="text-sm text-muted-foreground">Properties Owned</p>
						<p class="text-2xl font-bold text-primary">{$activeRealEstateData?.records?.length || 0}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Total Value</p>
						<p class="text-2xl font-bold text-primary">{formatCurrency(totalPropertyValue)}</p>
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Monthly Expenses</p>
						<p class="text-2xl font-bold text-primary">{formatCurrency(totalMonthlyExpenses)}</p>
						<p class="text-xs text-muted-foreground">Taxes + Insurance</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}
	
	{#if ($activeRealEstateData?.records?.length || 0) === 0}
		<Card class="border-dashed">
			<CardContent class="py-12">
				<div class="text-center space-y-4">
					<div class="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
						<Building2 class="h-8 w-8 text-muted-foreground" />
					</div>
					<div>
						<h3 class="font-medium text-lg">No Real Estate Owned</h3>
						<p class="text-muted-foreground text-sm">
							Add properties you currently own or have recently sold
						</p>
					</div>
					<Button onclick={addProperty} class="gap-2">
						<Plus class="h-4 w-4" />
						Add Property
					</Button>
				</div>
			</CardContent>
		</Card>
	{:else}
		{#each $activeRealEstateData?.records || [] as property, idx}
			{@const propertyTypeValue = property.propertyType || undefined}
			{@const propertyStatusValue = property.propertyStatus || undefined}
			{@const occupancyTypeValue = property.occupancyType || undefined}
			<Card>
				<CardHeader class="flex flex-row items-start justify-between space-y-0">
					<div class="flex items-center gap-3">
						<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<Home class="h-5 w-5 text-primary" />
						</div>
						<div>
							<CardTitle class="text-lg">
								{property.address?.formattedAddress || property.address?.address1 || `Property ${idx + 1}`}
							</CardTitle>
							<CardDescription>
								{property.propertyType || 'Property type not specified'}
								{#if property.currentResidence}
									<span class="text-success"> • Current Residence</span>
								{/if}
							</CardDescription>
						</div>
					</div>
					<Button variant="ghost" size="icon" onclick={() => removeProperty(property.id)}>
						<Trash2 class="h-4 w-4 text-destructive" />
					</Button>
				</CardHeader>
				<CardContent class="space-y-6">
					<!-- Property Address -->
					<div class="space-y-2">
						<Label class="after:content-['*'] after:ml-0.5 after:text-destructive">Property Address</Label>
						<AddressAutocomplete
							value={property.address}
							placeholder="Start typing property address..."
							onchange={(addr) => updateProperty(property.id, 'address', addr)}
						/>
						{#if property.address?.formattedAddress}
							<p class="text-sm text-muted-foreground">{property.address.formattedAddress}</p>
						{/if}
					</div>
					
					<!-- Property Type & Status -->
					<div class="grid md:grid-cols-3 gap-4">
						<ValidatedSelect
							label="Property Type"
							value={propertyTypeValue}
							onValueChange={(value) => {
								if (value !== undefined && value !== null) {
									updateProperty(property.id, 'propertyType', value);
								}
							}}
							options={propertyTypes}
							placeholder="Select type..."
							required
							showError={true}
						/>
						<ValidatedSelect
							label="Property Status"
							value={propertyStatusValue}
							onValueChange={(value) => {
								if (value !== undefined && value !== null) {
									updateProperty(property.id, 'propertyStatus', value);
								}
							}}
							options={propertyStatuses}
							placeholder="Select status..."
							required
							showError={true}
						/>
						<ValidatedSelect
							label="Intended Occupancy"
							value={occupancyTypeValue}
							onValueChange={(value) => {
								if (value !== undefined && value !== null) {
									updateProperty(property.id, 'occupancyType', value);
								}
							}}
							options={occupancyTypes}
							placeholder="Select occupancy..."
							required
							showError={true}
						/>
					</div>
					
					<!-- Property Value -->
					<div class="space-y-2">
						<Label class="after:content-['*'] after:ml-0.5 after:text-destructive">Property Value</Label>
						<div class="relative">
							<DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="number"
								class="pl-9"
								value={property.propertyValue}
								oninput={(e) => updateProperty(property.id, 'propertyValue', parseFloat(e.currentTarget.value) || 0)}
								placeholder="0.00"
							/>
						</div>
					</div>
					
					<!-- Monthly Expenses -->
					<div class="grid md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label>Monthly Property Taxes</Label>
							<div class="relative">
								<DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="number"
									class="pl-9"
									value={property.monthlyTaxes}
									oninput={(e) => updateProperty(property.id, 'monthlyTaxes', parseFloat(e.currentTarget.value) || 0)}
									placeholder="0.00"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<Label>Monthly Insurance</Label>
							<div class="relative">
								<DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="number"
									class="pl-9"
									value={property.monthlyInsurance}
									oninput={(e) => updateProperty(property.id, 'monthlyInsurance', parseFloat(e.currentTarget.value) || 0)}
									placeholder="0.00"
								/>
							</div>
						</div>
					</div>
					
					<!-- Current Residence Toggle -->
					<div class="flex items-center justify-between p-4 rounded-lg bg-muted/50">
						<div>
							<Label>Current Residence</Label>
							<p class="text-sm text-muted-foreground">This is where I currently live</p>
						</div>
						<Switch
							checked={property.currentResidence}
							onCheckedChange={(checked) => updateProperty(property.id, 'currentResidence', checked)}
						/>
					</div>
					
					<!-- Monthly Expense Summary -->
					<div class="p-4 rounded-lg border bg-card">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">Total Monthly Expenses</span>
							<span class="font-semibold">
								{formatCurrency((property.monthlyTaxes || 0) + (property.monthlyInsurance || 0))}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
		
		<Button onclick={addProperty} variant="secondary" class="gap-2">
			<Plus class="h-4 w-4" />
			Add Another Property
		</Button>
	{/if}
</div>
