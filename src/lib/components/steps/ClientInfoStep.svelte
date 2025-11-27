<script lang="ts">
	import { applicationStore, activeClientId, activeClientData, activeAddressData } from '$lib/stores/application';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui';
	import { Input, Label, Checkbox, Switch, Button } from '$lib/components/ui';
	import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '$lib/components/ui';
	import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
	import ClientTabs from './ClientTabs.svelte';
	import { Plus, Trash2, Home, Mail } from 'lucide-svelte';
	import type { AddressType } from '$lib/types/address';
	
	let useMailingAddress = $state(false);
	
	function updateField(field: string, value: string | boolean) {
		applicationStore.updateClientData($activeClientId, { [field]: value });
	}
	
	function updatePresentAddress(address: AddressType) {
		applicationStore.updatePresentAddress($activeClientId, { 
			addr: address 
		});
	}
	
	function updatePresentAddressDate(field: 'fromDate' | 'toDate', value: string) {
		applicationStore.updatePresentAddress($activeClientId, { [field]: value });
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
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	<!-- Personal Information -->
	<Card>
		<CardHeader>
			<CardTitle>Personal Information</CardTitle>
			<CardDescription>Basic identifying information for the borrower</CardDescription>
		</CardHeader>
		<CardContent class="space-y-6">
			<!-- Name -->
			<div class="grid md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="firstName">First Name</Label>
					<Input
						id="firstName"
						value={$activeClientData?.firstName || ''}
						oninput={(e) => updateField('firstName', e.currentTarget.value)}
						placeholder="John"
					/>
				</div>
				<div class="space-y-2">
					<Label for="lastName">Last Name</Label>
					<Input
						id="lastName"
						value={$activeClientData?.lastName || ''}
						oninput={(e) => updateField('lastName', e.currentTarget.value)}
						placeholder="Doe"
					/>
				</div>
			</div>
			
			<!-- Contact -->
			<div class="grid md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="email">Email Address</Label>
					<Input
						id="email"
						type="email"
						value={$activeClientData?.email || ''}
						oninput={(e) => updateField('email', e.currentTarget.value)}
						placeholder="john.doe@example.com"
					/>
				</div>
				<div class="space-y-2">
					<Label for="phone">Phone Number</Label>
					<Input
						id="phone"
						type="tel"
						value={$activeClientData?.phone || ''}
						oninput={(e) => updateField('phone', e.currentTarget.value)}
						placeholder="(555) 123-4567"
					/>
				</div>
			</div>
			
			<!-- Personal Details -->
			<div class="grid md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="ssn">Social Security Number</Label>
					<Input
						id="ssn"
						value={$activeClientData?.ssn || ''}
						oninput={(e) => updateField('ssn', e.currentTarget.value)}
						placeholder="XXX-XX-XXXX"
					/>
				</div>
				<div class="space-y-2">
					<Label for="dob">Date of Birth</Label>
					<Input
						id="dob"
						type="date"
						value={$activeClientData?.dob || ''}
						oninput={(e) => updateField('dob', e.currentTarget.value)}
					/>
				</div>
			</div>
			
			<!-- Status -->
			<div class="grid md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label>Citizenship Status</Label>
					<Select 
						type="single" 
						value={$activeClientData?.citizenship || undefined}
						onValueChange={(value) => {
							if (value !== undefined && value !== null) {
								updateField('citizenship', value);
							}
						}}
					>
						<SelectTrigger class="w-full">
							<SelectValue 
								placeholder="Select status..." 
								value={getCitizenshipLabel($activeClientData?.citizenship)} 
							/>
						</SelectTrigger>
						<SelectContent>
							{#each citizenshipOptions as option}
								<SelectItem value={option.value}>{option.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>
				<div class="space-y-2">
					<Label>Marital Status</Label>
					<Select 
						type="single" 
						value={$activeClientData?.maritalStatus || undefined}
						onValueChange={(value) => {
							if (value !== undefined && value !== null) {
								updateField('maritalStatus', value);
							}
						}}
					>
						<SelectTrigger class="w-full">
							<SelectValue 
								placeholder="Select status..." 
								value={getMaritalStatusLabel($activeClientData?.maritalStatus)} 
							/>
						</SelectTrigger>
						<SelectContent>
							{#each maritalStatusOptions as option}
								<SelectItem value={option.value}>{option.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>
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
				<div class="space-y-2">
					<Label for="presentFromDate">Move-in Date</Label>
					<Input
						id="presentFromDate"
						type="date"
						value={$activeAddressData?.present?.fromDate || ''}
						oninput={(e) => updatePresentAddressDate('fromDate', e.currentTarget.value)}
					/>
				</div>
				<div class="space-y-2">
					<Label>Years at Address</Label>
					<Input
						type="text"
						readonly
						value={$activeAddressData?.present?.fromDate 
							? `${Math.floor((Date.now() - new Date($activeAddressData.present.fromDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`
							: 'Enter move-in date'}
						class="bg-muted"
					/>
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
	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0">
			<div>
				<CardTitle>Former Addresses</CardTitle>
				<CardDescription>Previous addresses (if less than 2 years at present address)</CardDescription>
			</div>
			<Button variant="outline" size="sm" onclick={addFormerAddress} class="gap-2">
				<Plus class="h-4 w-4" />
				Add Former Address
			</Button>
		</CardHeader>
		<CardContent>
			{#if $activeAddressData?.former?.length === 0}
				<p class="text-muted-foreground text-center py-6">
					No former addresses added. Add if you've lived at your current address for less than 2 years.
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
							/>
							<div class="grid md:grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label>From Date</Label>
									<Input type="date" value={addr.fromDate} />
								</div>
								<div class="space-y-2">
									<Label>To Date</Label>
									<Input type="date" value={addr.toDate} />
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
    
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
						placeholder="Start typing mailing address..."
					/>
				</div>
			</CardContent>
		{/if}
	</Card>
	
</div>
