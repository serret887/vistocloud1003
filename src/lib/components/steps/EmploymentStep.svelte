<script lang="ts">
	import { applicationStore, activeClientId, activeEmploymentData, currentStepValidationErrors } from '$lib/stores/application';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui';
	import { Input, Label, Switch, Checkbox, Button, Textarea } from '$lib/components/ui';
	import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '$lib/components/ui';
	import { ValidatedSelect, DateInput, PhoneInput } from '$lib/components/ui/validated-input';
	import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
	import ValidationErrors from '../ValidationErrors.svelte';
	import { Plus, Trash2, Building2, AlertTriangle } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	import type { AddressType } from '$lib/types/address';
	import { cn } from '$lib/utils';
	
	const incomeTypes = [
		{ value: 'salary', label: 'Salary' },
		{ value: 'hourly', label: 'Hourly' },
		{ value: 'commission', label: 'Commission' },
		{ value: 'contract', label: 'Contract' },
		{ value: 'other', label: 'Other' }
	];
	
	function addEmployment() {
		applicationStore.addEmploymentRecord($activeClientId);
	}
	
	function updateRecord(recordId: string, field: string, value: string | boolean | number | AddressType) {
		applicationStore.updateEmploymentRecord($activeClientId, recordId, { [field]: value });
		// Re-validate step after updating
		setTimeout(() => applicationStore.revalidateCurrentStep(), 100);
	}
	
	function removeRecord(recordId: string) {
		applicationStore.removeEmploymentRecord($activeClientId, recordId);
	}
	
	// Calculate total employment coverage
	function calculateCoverageMonths(): number {
		const records = $activeEmploymentData?.records || [];
		let totalMonths = 0;
		const now = new Date();
		
		for (const record of records) {
			if (record.startDate) {
				const start = new Date(record.startDate);
				const end = record.currentlyEmployed ? now : (record.endDate ? new Date(record.endDate) : now);
				const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
				totalMonths += Math.max(0, months);
			}
		}
		return totalMonths;
	}
	
	let coverageMonths = $derived(calculateCoverageMonths());
	let needsMoreHistory = $derived(coverageMonths < 24);
	
	// Helper to check if a field has validation error
	function hasFieldError(fieldPath: string): boolean {
		return $currentStepValidationErrors.some(err => err.field === fieldPath);
	}
	
	// Helper to get error message for a field
	function getFieldError(fieldPath: string): string | null {
		const error = $currentStepValidationErrors.find(err => err.field === fieldPath);
		return error?.message || null;
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	<!-- Validation Errors -->
	{#if $currentStepValidationErrors.length > 0}
		<ValidationErrors errors={$currentStepValidationErrors} />
	{/if}
	
	<!-- Employment Coverage Warning -->
	{#if needsMoreHistory && ($activeEmploymentData?.records?.length || 0) > 0}
		<div class="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
			<AlertTriangle class="h-5 w-5 text-warning shrink-0" />
			<div class="text-sm">
				<span class="font-medium">Employment history gap:</span> 
				Currently showing {coverageMonths} months. Please add at least 24 months (2 years) of employment history.
			</div>
		</div>
	{/if}
	
	{#if ($activeEmploymentData?.records?.length || 0) === 0}
		<Card class="border-dashed">
			<CardContent class="py-12">
				<div class="text-center space-y-4">
					<div class="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
						<Building2 class="h-8 w-8 text-muted-foreground" />
					</div>
					<div>
						<h3 class="font-medium text-lg">No Employment Records</h3>
						<p class="text-muted-foreground text-sm">
							Add employment history for the past 2 years
						</p>
					</div>
					<Button onclick={addEmployment} class="gap-2">
						<Plus class="h-4 w-4" />
						Add Employer
					</Button>
				</div>
			</CardContent>
		</Card>
	{:else}
		{#each $activeEmploymentData?.records || [] as record, idx}
			{@const incomeTypeValue = record.incomeType || undefined}
			<Card>
				<CardHeader class="flex flex-row items-start justify-between space-y-0">
					<div>
						<CardTitle class="text-lg">
							{record.employerName || `Employer ${idx + 1}`}
						</CardTitle>
						<CardDescription>
							{record.jobTitle || 'No position specified'}
							{#if record.currentlyEmployed}
								<span class="text-success"> • Current</span>
							{/if}
						</CardDescription>
					</div>
					<Button variant="ghost" size="icon" onclick={() => removeRecord(record.id)}>
						<Trash2 class="h-4 w-4 text-destructive" />
					</Button>
				</CardHeader>
				<CardContent class="space-y-6">
					<!-- Employer Info -->
					<div class="grid md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label class="after:content-['*'] after:ml-0.5 after:text-destructive">Employer Name</Label>
							<Input
								value={record.employerName}
								oninput={(e) => updateRecord(record.id, 'employerName', e.currentTarget.value)}
								placeholder="Company Name"
								class={hasFieldError(`employment.${idx}.employerName`) ? 'border-destructive focus-visible:border-destructive' : ''}
							/>
							{#if hasFieldError(`employment.${idx}.employerName`)}
								<p class="text-sm text-destructive">{getFieldError(`employment.${idx}.employerName`)}</p>
							{/if}
						</div>
						<div class="space-y-2">
							<PhoneInput
								label="Employer Phone"
								value={record.phoneNumber || ''}
								onValueChange={(val) => updateRecord(record.id, 'phoneNumber', val)}
								required
							/>
							{#if hasFieldError(`employment.${idx}.phoneNumber`)}
								<p class="text-sm text-destructive">{getFieldError(`employment.${idx}.phoneNumber`)}</p>
							{/if}
						</div>
					</div>
					
					<!-- Employer Address -->
					<div class="space-y-2">					
						<Label class="after:content-['*'] after:ml-0.5 after:text-destructive">Employer Address</Label>
						<div class={hasFieldError(`employment.${idx}.employerAddress`) ? 'border border-destructive rounded-md p-1' : ''}>
							<AddressAutocomplete
								value={record.employerAddress}
								placeholder="Start typing employer address..."
								onchange={(addr) => updateRecord(record.id, 'employerAddress', addr)}
							/>
						</div>
						{#if record.employerAddress?.formattedAddress}
							<p class="text-sm text-muted-foreground">{record.employerAddress.formattedAddress}</p>
						{/if}
						{#if hasFieldError(`employment.${idx}.employerAddress`)}
							<p class="text-sm text-destructive">{getFieldError(`employment.${idx}.employerAddress`)}</p>
						{/if}
					</div>
					
					<!-- Job Info -->
					<div class="grid md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label class="after:content-['*'] after:ml-0.5 after:text-destructive">Job Title / Position</Label>
							<Input
								value={record.jobTitle}
								oninput={(e) => updateRecord(record.id, 'jobTitle', e.currentTarget.value)}
								placeholder="Software Engineer"
								class={hasFieldError(`employment.${idx}.jobTitle`) ? 'border-destructive focus-visible:border-destructive' : ''}
							/>
							{#if hasFieldError(`employment.${idx}.jobTitle`)}
								<p class="text-sm text-destructive">{getFieldError(`employment.${idx}.jobTitle`)}</p>
							{/if}
						</div>
						<div class="space-y-2">
						<ValidatedSelect
							label="Income Type"
							value={incomeTypeValue}
							onValueChange={(value) => {
								if (value !== undefined && value !== null) {
									updateRecord(record.id, 'incomeType', value);
								}
							}}
							options={incomeTypes}
							required
							placeholder="Select type..."
							showError={true}
							error={hasFieldError(`employment.${idx}.incomeType`) ? getFieldError(`employment.${idx}.incomeType`) : undefined}
						/>
						</div>
					</div>
					
					<!-- Dates -->
					<div class="grid md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<DateInput
								label="Start Date"
								value={record.startDate || ''}
								onValueChange={(val) => updateRecord(record.id, 'startDate', val)}
								required
								allowFuture={false}
							/>
							{#if hasFieldError(`employment.${idx}.startDate`)}
								<p class="text-sm text-destructive">{getFieldError(`employment.${idx}.startDate`)}</p>
							{/if}
						</div>
						{#if !record.currentlyEmployed && !record.hasOfferLetter}
							<div class="space-y-2">
								<DateInput
									label="End Date"
									value={record.endDate || ''}
									onValueChange={(val) => updateRecord(record.id, 'endDate', val)}
									required
									allowFuture={false}
								/>
								{#if hasFieldError(`employment.${idx}.endDate`)}
									<p class="text-sm text-destructive">{getFieldError(`employment.${idx}.endDate`)}</p>
								{/if}
							</div>
						{/if}
					</div>
					
					<!-- Toggles Row 1 -->
					<div class="grid md:grid-cols-2 gap-4">
						{#if !record.hasOfferLetter}
						<div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
							<div>
								<Label>Currently Employed Here</Label>
								<p class="text-xs text-muted-foreground">Is this your current job?</p>
							</div>
							<Switch
								checked={record.currentlyEmployed}
								onCheckedChange={(checked) => updateRecord(record.id, 'currentlyEmployed', checked)}
							/>
						</div>
						{/if}
						<div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
							<div>
								<Label>Self Employed</Label>
								<p class="text-xs text-muted-foreground">Own business or independent contractor</p>
							</div>
							<Switch
								checked={record.selfEmployed}
								onCheckedChange={(checked) => updateRecord(record.id, 'selfEmployed', checked)}
							/>
						</div>
					</div>
					
					<!-- Toggles Row 2 -->
					<div class="grid md:grid-cols-2 gap-4">
						{#if record.selfEmployed}
						<div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
							<div>
								<Label>25% or More Ownership</Label>
								<p class="text-xs text-muted-foreground">Own 25%+ of the business</p>
							</div>
							<Switch
								checked={record.ownershipPercentage}
								onCheckedChange={(checked) => updateRecord(record.id, 'ownershipPercentage', checked)}
							/>
						</div>
						{/if}
						<div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
							<div>
								<Label>Related Party</Label>
								<p class="text-xs text-muted-foreground">Employed by family member</p>
							</div>
							<Switch
								checked={record.relatedParty}
								onCheckedChange={(checked) => updateRecord(record.id, 'relatedParty', checked)}
							/>
						</div>
					</div>
					
					<!-- Offer Letter (only show if not currently employed) -->
					{#if !record.currentlyEmployed}
					<div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
						<div>
							<Label>Has Offer Letter</Label>
							<p class="text-xs text-muted-foreground">For future employment starting within 90 days</p>
						</div>
						<Switch
							checked={record.hasOfferLetter}
							onCheckedChange={(checked) => updateRecord(record.id, 'hasOfferLetter', checked)}
						/>
					</div>
					{/if}
				</CardContent>
			</Card>
		{/each}
		
		<Button onclick={addEmployment} variant="secondary" class="gap-2">
			<Plus class="h-4 w-4" />
			Add Another Employer
		</Button>
	{/if}
	
</div>
