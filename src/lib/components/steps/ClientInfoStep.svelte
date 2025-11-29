<script lang="ts">
	import { applicationStore, activeClientId, activeClientData, activeAddressData, currentStepValidationErrors } from '$lib/stores/application';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui';
	import { Input, Label, Checkbox, Switch, Button, Textarea } from '$lib/components/ui';
	import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '$lib/components/ui';
	import { SSNInput, DateInput, ValidatedInput, ValidatedSelect, NameInput, EmailInput, PhoneInput } from '$lib/components/ui/validated-input';
	import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
	import ClientTabs from './ClientTabs.svelte';
	import ValidationErrors from '../ValidationErrors.svelte';
	import { Plus, Trash2, Home, Mail, AlertCircle } from 'lucide-svelte';
	import type { AddressType } from '$lib/types/address';
	import { cn } from '$lib/utils';
	
	let useMailingAddress = $state(false);
	
	function updateField(field: string, value: string | boolean) {
		applicationStore.updateClientData($activeClientId, { [field]: value });
		// Re-validate step after updating
		setTimeout(() => applicationStore.revalidateCurrentStep(), 100);
	}
	
	function updatePresentAddress(address: AddressType) {
		applicationStore.updatePresentAddress($activeClientId, { 
			addr: address 
		});
		// Re-validate step after updating
		setTimeout(() => applicationStore.revalidateCurrentStep(), 100);
	}
	
	function updatePresentAddressDate(field: 'fromDate' | 'toDate', value: string) {
		applicationStore.updatePresentAddress($activeClientId, { [field]: value });
		// Re-validate step after updating
		setTimeout(() => applicationStore.revalidateCurrentStep(), 100);
	}
	
	function addFormerAddress() {
		applicationStore.addFormerAddress($activeClientId);
	}
	
	// Citizenship options
	const citizenshipOptions = [
		{ value: 'US Citizen', label: 'US Citizen' },
		{ value: 'Permanent Resident Alien', label: 'Permanent Resident Alien' },
		{ value: 'Non-Permanent Resident Alien', label: 'Non-Permanent Resident Alien' }
	];
	
	// Marital status options
	const maritalStatusOptions = [
		{ value: 'Married', label: 'Married' },
		{ value: 'Unmarried', label: 'Unmarried' },
		{ value: 'Separated', label: 'Separated' }
	];
	
	// Helper function to get label for citizenship
	function getCitizenshipLabel(value: string | undefined): string | undefined {
		if (!value) return undefined;
		return citizenshipOptions.find(opt => opt.value === value)?.label;
	}
	
	// Helper function to get label for marital status
	function getMaritalStatusLabel(value: string | undefined): string | undefined {
		if (!value) return undefined;
		return maritalStatusOptions.find(opt => opt.value === value)?.label;
	}

	// Calculate months at present address
	const getMonthsAtAddress = $derived.by(() => {
		const fromDate = $activeAddressData?.present?.fromDate;
		if (!fromDate) return 0;
		
		const moveInDate = new Date(fromDate);
		const today = new Date();
		const diffTime = today.getTime() - moveInDate.getTime();
		const diffMonths = diffTime / (30.44 * 24 * 60 * 60 * 1000); // Average days per month
		
		return Math.floor(diffMonths);
	});

	// Show former addresses only if less than 24 months (2 years) at present address
	const shouldShowFormerAddresses = $derived.by(() => {
		const months = getMonthsAtAddress;
		return months > 0 && months < 24;
	});
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	<!-- Validation Errors -->
	{#if $currentStepValidationErrors.length > 0}
		<ValidationErrors errors={$currentStepValidationErrors} />
	{/if}
	
	<!-- Personal Information -->
	<Card>
		<CardHeader>
			<CardTitle>Personal Information</CardTitle>
			<CardDescription>Basic identifying information for the borrower</CardDescription>
		</CardHeader>
		<CardContent class="space-y-6">
			<!-- Name -->
			<div class="grid md:grid-cols-2 gap-4">
				<NameInput
					label="First Name"
					value={$activeClientData?.firstName || ''}
					onValueChange={(val) => updateField('firstName', val)}
					placeholder="John"
					required
					allowSpaces={true}
				/>
				<NameInput
					label="Last Name"
					value={$activeClientData?.lastName || ''}
					onValueChange={(val) => updateField('lastName', val)}
					placeholder="Doe"
					required
					allowSpaces={true}
				/>
			</div>
			
			<!-- Contact -->
			<div class="grid md:grid-cols-2 gap-4">
				<EmailInput
					label="Email Address"
					value={$activeClientData?.email || ''}
					onValueChange={(val) => updateField('email', val)}
					placeholder="john.doe@example.com"
					required
				/>
				<PhoneInput
					label="Phone Number"
					value={$activeClientData?.phone || ''}
					onValueChange={(val) => updateField('phone', val)}
					required
				/>
			</div>
			
			<!-- Personal Details -->
			<div class="grid md:grid-cols-2 gap-4">
				<SSNInput
					label="Social Security Number"
					value={$activeClientData?.ssn || ''}
					onValueChange={(val) => updateField('ssn', val)}
					required
				/>
				<DateInput
					label="Date of Birth"
					value={$activeClientData?.dob || ''}
					onValueChange={(val) => updateField('dob', val)}
					required
					allowFuture={false}
				/>
			</div>
			
			<!-- Status -->
			<div class="grid md:grid-cols-2 gap-4">
				<ValidatedSelect
					label="Citizenship Status"
					value={$activeClientData?.citizenship || undefined}
					onValueChange={(value) => {
						console.log('📝 [CLIENT-INFO] Citizenship onValueChange called with:', value);
						if (value !== undefined && value !== null) {
							console.log('📝 [CLIENT-INFO] Calling updateField for citizenship:', value);
							updateField('citizenship', value);
							console.log('📝 [CLIENT-INFO] After updateField, store value:', $activeClientData?.citizenship);
						} else {
							console.warn('⚠️ [CLIENT-INFO] Citizenship value is undefined or null');
						}
					}}
					options={citizenshipOptions}
					placeholder="Select status..."
					required
					showError={true}
				/>
				<ValidatedSelect
					label="Marital Status"
					value={$activeClientData?.maritalStatus || undefined}
					onValueChange={(value) => {
						console.log('📝 [CLIENT-INFO] Marital Status onValueChange called with:', value);
						if (value !== undefined && value !== null) {
							console.log('📝 [CLIENT-INFO] Calling updateField for maritalStatus:', value);
							updateField('maritalStatus', value);
							console.log('📝 [CLIENT-INFO] After updateField, store value:', $activeClientData?.maritalStatus);
						} else {
							console.warn('⚠️ [CLIENT-INFO] Marital Status value is undefined or null');
						}
					}}
					options={maritalStatusOptions}
					placeholder="Select status..."
					required
					showError={true}
				/>
			</div>
			
			<!-- Military Service -->
			<div class="flex items-center justify-between p-4 rounded-lg bg-muted/50">
				<div>
					<div class="font-medium">Military Service</div>
					<div class="text-sm text-muted-foreground">
						Have you served in the U.S. Armed Forces?
					</div>
				</div>
				<Switch
					checked={$activeClientData?.hasMilitaryService || false}
					onCheckedChange={(checked) => updateField('hasMilitaryService', checked)}
				/>
			</div>
			
			<!-- General Notes -->
			<div class="space-y-2">
				<Label>General Notes</Label>
				<Textarea
					placeholder="Add any notes about this client that may help with processing (not part of the application form)..."
					value={$activeClientData?.generalNotes || ''}
					oninput={(e) => updateField('generalNotes', e.currentTarget.value)}
					class="min-h-[100px]"
				/>
				<p class="text-xs text-muted-foreground">
					These notes are for internal use only and will not be included in the application.
				</p>
			</div>
		</CardContent>
	</Card>
	
	<!-- Present Address -->
	<Card>
		<CardHeader>
			<div class="flex items-center gap-2">
				<Home class="h-5 w-5 text-primary" />
				<div>
					<CardTitle>Present Address</CardTitle>
					<CardDescription>Current residence address</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-2">
				<Label>Street Address</Label>
				<AddressAutocomplete
					value={$activeAddressData?.present?.addr}
					placeholder="Start typing your address..."
					onchange={updatePresentAddress}
				/>
			</div>
			
			<div class="grid md:grid-cols-2 gap-4">
				<DateInput
					label="Move-in Date"
					value={$activeAddressData?.present?.fromDate || ''}
					onValueChange={(val) => updatePresentAddressDate('fromDate', val)}
					required
					allowFuture={false}
				/>
				<div class="space-y-2">
					<Label>Months at Address</Label>
					<div class={cn(
						"px-3 py-2 text-sm rounded-md border bg-muted",
						shouldShowFormerAddresses && "border-warning/50 text-warning-foreground"
					)}>
						{(() => {
							const months = getMonthsAtAddress;
							return months === 0 
								? 'Enter move-in date'
								: months < 24
									? `${months} months (Former addresses required)`
									: `${months} months`;
						})()}
					</div>
					{#if shouldShowFormerAddresses}
						<p class="text-sm text-warning flex items-center gap-1">
							<AlertCircle class="h-3 w-3" />
							You must provide former addresses (less than 24 months at current address)
						</p>
					{/if}
				</div>
			</div>
			
			<!-- Display resolved address details -->
			{#if $activeAddressData?.present?.addr?.formattedAddress}
				<div class="p-3 rounded-lg bg-muted/50 text-sm">
					<div class="font-medium mb-1">Resolved Address:</div>
					<div>{$activeAddressData.present.addr.formattedAddress}</div>
					{#if $activeAddressData.present.addr.city}
						<div class="text-muted-foreground mt-1">
							{$activeAddressData.present.addr.city}, {$activeAddressData.present.addr.region} {$activeAddressData.present.addr.postalCode}
						</div>
					{/if}
				</div>
			{/if}
		</CardContent>
	</Card>
	<!-- Former Addresses -->
	{#if shouldShowFormerAddresses}
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0">
				<div>
					<CardTitle>Former Addresses</CardTitle>
					<CardDescription>Previous addresses (required: less than 24 months at present address)</CardDescription>
				</div>
				<Button variant="outline" size="sm" onclick={addFormerAddress} class="gap-2">
					<Plus class="h-4 w-4" />
					Add Former Address
				</Button>
			</CardHeader>
			<CardContent>
				{#if $activeAddressData?.former?.length === 0}
					<p class="text-warning text-center py-6 flex items-center justify-center gap-2">
						<AlertCircle class="h-4 w-4" />
						You must add at least one former address (less than 24 months at current address)
					</p>
			{:else}
				<div class="space-y-4">
					{#each $activeAddressData?.former || [] as addr, idx}
						<div class="p-4 rounded-lg border space-y-4">
							<div class="flex items-center justify-between">
								<span class="font-medium">Former Address {idx + 1}</span>
								<Button variant="ghost" size="icon">
									<Trash2 class="h-4 w-4 text-destructive" />
								</Button>
							</div>
							<AddressAutocomplete
								value={addr.addr}
								placeholder="Start typing former address..."
								onchange={(address) => {
									applicationStore.updateFormerAddress($activeClientId, addr.id, { addr: address });
									setTimeout(() => applicationStore.revalidateCurrentStep(), 100);
								}}
							/>
							<div class="grid md:grid-cols-2 gap-4">
								<DateInput
									label="From Date"
									value={addr.fromDate || ''}
									onValueChange={(val) => {
										applicationStore.updateFormerAddress($activeClientId, addr.id, { fromDate: val });
										setTimeout(() => applicationStore.revalidateCurrentStep(), 100);
									}}
									required
									allowFuture={false}
								/>
								<DateInput
									label="To Date"
									value={addr.toDate || ''}
									onValueChange={(val) => {
										applicationStore.updateFormerAddress($activeClientId, addr.id, { toDate: val });
										setTimeout(() => applicationStore.revalidateCurrentStep(), 100);
									}}
									required
									allowFuture={false}
									maxDate={new Date().toISOString().split('T')[0]}
								/>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
	{/if}
    
	<!-- Mailing Address -->
	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Mail class="h-5 w-5 text-primary" />
					<div>
						<CardTitle>Mailing Address</CardTitle>
						<CardDescription>Where should mail be sent?</CardDescription>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<Checkbox
						checked={!useMailingAddress}
						onCheckedChange={(checked) => useMailingAddress = !checked}
					/>
					<Label class="text-sm">Same as present address</Label>
				</div>
			</div>
		</CardHeader>
		{#if useMailingAddress}
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label>Mailing Address</Label>
					<AddressAutocomplete
						value={$activeAddressData?.mailing?.addr}
						placeholder="Start typing mailing address..."
						onchange={(address) => applicationStore.updateMailingAddress($activeClientId, { addr: address })}
					/>
				</div>
			</CardContent>
		{/if}
	</Card>
	
</div>
