<script lang="ts">
	import { applicationStore, activeClientId, activeAssetsData, clientIds } from '$lib/stores/application';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui';
	import { Input, Label, Button, Checkbox } from '$lib/components/ui';
	import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '$lib/components/ui';
	import { Plus, Trash2, Wallet, DollarSign, Users, Building, PiggyBank, Gift, TrendingUp } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	import type { AssetCategory } from '$lib/types/assets';
	
	const assetCategories: { value: AssetCategory; label: string; icon: typeof Wallet; description: string }[] = [
		{ value: 'BankAccount', label: 'Bank Account', icon: Building, description: 'Checking, Savings, Money Market' },
		{ value: 'StocksAndBonds', label: 'Stocks & Bonds', icon: TrendingUp, description: 'Stocks, Bonds, Mutual Funds' },
		{ value: 'LifeInsurance', label: 'Life Insurance', icon: Wallet, description: 'Cash value of life insurance' },
		{ value: 'RetirementFund', label: 'Retirement Fund', icon: PiggyBank, description: '401k, IRA, Pension' },
		{ value: 'Gift', label: 'Gift', icon: Gift, description: 'Gifted funds for down payment' },
		{ value: 'Other', label: 'Other', icon: Wallet, description: 'Other assets' }
	];
	
	const accountTypes: Record<AssetCategory, { value: string; label: string }[]> = {
		'BankAccount': [
			{ value: 'Checking', label: 'Checking' },
			{ value: 'Savings', label: 'Savings' },
			{ value: 'Money Market', label: 'Money Market' },
			{ value: 'CD', label: 'CD' },
			{ value: 'Other', label: 'Other' }
		],
		'StocksAndBonds': [
			{ value: 'Stocks', label: 'Stocks' },
			{ value: 'Bonds', label: 'Bonds' },
			{ value: 'Mutual Funds', label: 'Mutual Funds' },
			{ value: 'ETFs', label: 'ETFs' },
			{ value: 'Other', label: 'Other' }
		],
		'LifeInsurance': [
			{ value: 'Whole Life', label: 'Whole Life' },
			{ value: 'Universal Life', label: 'Universal Life' },
			{ value: 'Variable Life', label: 'Variable Life' },
			{ value: 'Other', label: 'Other' }
		],
		'RetirementFund': [
			{ value: '401k', label: '401k' },
			{ value: 'IRA', label: 'IRA' },
			{ value: 'Roth IRA', label: 'Roth IRA' },
			{ value: 'Pension', label: 'Pension' },
			{ value: '403b', label: '403b' },
			{ value: 'Other', label: 'Other' }
		],
		'Gift': [
			{ value: 'Family Gift', label: 'Family Gift' },
			{ value: 'Employer Gift', label: 'Employer Gift' },
			{ value: 'Other', label: 'Other' }
		],
		'Other': [
			{ value: 'Other', label: 'Other' }
		]
	};
	
	function addAsset(category: AssetCategory) {
		applicationStore.addAssetRecord($activeClientId, category);
	}
	
	function updateAsset(recordId: string, field: string, value: string | number | string[]) {
		applicationStore.updateAssetRecord($activeClientId, recordId, { [field]: value });
	}
	
	function removeAsset(recordId: string) {
		applicationStore.removeAssetRecord($activeClientId, recordId);
	}
	
	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
	}
	
	function getCategoryInfo(category: AssetCategory) {
		return assetCategories.find(c => c.value === category) || assetCategories[5];
	}
	
	// Calculate total assets
	let totalAssets = $derived(
		($activeAssetsData?.records || []).reduce((sum, rec) => sum + (rec.amount || 0), 0)
	);
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	<!-- Assets Summary Card -->
	<Card class="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
		<CardContent class="py-6">
			<div class="text-center">
				<p class="text-sm text-muted-foreground">Total Assets</p>
				<p class="text-3xl font-bold text-success">{formatCurrency(totalAssets)}</p>
			</div>
		</CardContent>
	</Card>
	
	{#if ($activeAssetsData?.records?.length || 0) === 0}
		<Card class="border-dashed">
			<CardContent class="py-12">
				<div class="text-center space-y-4">
					<div class="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
						<Wallet class="h-8 w-8 text-muted-foreground" />
					</div>
					<div>
						<h3 class="font-medium text-lg">No Assets Added</h3>
						<p class="text-muted-foreground text-sm">
							Add your assets to complete the application
						</p>
					</div>
					<div class="grid md:grid-cols-3 gap-3 max-w-2xl mx-auto">
						{#each assetCategories as cat}
							{@const Icon = cat.icon}
							<button
								onclick={() => addAsset(cat.value)}
								class="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left"
							>
								<Icon class="h-5 w-5 text-primary mb-2" />
								<div class="font-medium text-sm">{cat.label}</div>
								<div class="text-xs text-muted-foreground">{cat.description}</div>
							</button>
						{/each}
					</div>
				</div>
			</CardContent>
		</Card>
	{:else}
		{#each $activeAssetsData?.records || [] as asset}
			{@const catInfo = getCategoryInfo(asset.category)}
			{@const CatIcon = catInfo.icon}
			{@const accountTypeValue = asset.type || undefined}
			<Card>
				<CardHeader class="flex flex-row items-start justify-between space-y-0">
					<div class="flex items-center gap-3">
						<div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<CatIcon class="h-5 w-5 text-primary" />
						</div>
						<div>
							<CardTitle class="text-lg">{catInfo.label}</CardTitle>
							<CardDescription>
								{asset.institutionName || 'No institution specified'}
								{#if asset.sharedClientIds?.length}
									<span class="text-primary"> • Joint Account</span>
								{/if}
							</CardDescription>
						</div>
					</div>
					<Button variant="ghost" size="icon" onclick={() => removeAsset(asset.id)}>
						<Trash2 class="h-4 w-4 text-destructive" />
					</Button>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label>Institution Name *</Label>
							<Input
								value={asset.institutionName || ''}
								oninput={(e) => updateAsset(asset.id, 'institutionName', e.currentTarget.value)}
								placeholder="Bank of America, Fidelity, etc."
							/>
						</div>
						<div class="space-y-2">
							<Label>Account Type</Label>
							<Select 
								type="single" 
								value={accountTypeValue}
								onValueChange={(value) => {
									if (value !== undefined && value !== null) {
										updateAsset(asset.id, 'type', value);
									}
								}}
							>
								<SelectTrigger class="w-full">
									<SelectValue placeholder="Select type..." />
								</SelectTrigger>
								<SelectContent>
									{#each accountTypes[asset.category] || [] as type}
										<SelectItem value={type.value}>{type.label}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>
					</div>
					
					<div class="grid md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label>Account Number (last 4 digits)</Label>
							<Input
								value={asset.accountNumber || ''}
								oninput={(e) => updateAsset(asset.id, 'accountNumber', e.currentTarget.value)}
								placeholder="****1234"
								maxlength={4}
							/>
						</div>
						<div class="space-y-2">
							<Label>Current Value *</Label>
							<div class="relative">
								<DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="number"
									class="pl-9"
									value={asset.amount}
									oninput={(e) => updateAsset(asset.id, 'amount', parseFloat(e.currentTarget.value) || 0)}
									placeholder="0.00"
								/>
							</div>
						</div>
					</div>
					
					<!-- Gift Source (only for Gift category) -->
					{#if asset.category === 'Gift'}
						<div class="space-y-2">
							<Label>Gift Source *</Label>
							<Input
								value={asset.source || ''}
								oninput={(e) => updateAsset(asset.id, 'source', e.currentTarget.value)}
								placeholder="Name of person/entity providing gift"
							/>
						</div>
					{/if}
					
					<!-- Joint Account -->
					{#if $clientIds.length > 1}
						<div class="p-4 rounded-lg border bg-muted/30">
							<div class="flex items-center gap-2 mb-3">
								<Users class="h-4 w-4 text-primary" />
								<Label>Joint Account Owners</Label>
							</div>
							<div class="space-y-2">
								{#each $clientIds.filter(id => id !== $activeClientId) as clientId}
									<div class="flex items-center gap-2">
										<Checkbox
											checked={asset.sharedClientIds?.includes(clientId) || false}
											onCheckedChange={(checked) => {
												const current = asset.sharedClientIds || [];
												const updated = checked 
													? [...current, clientId]
													: current.filter(id => id !== clientId);
												updateAsset(asset.id, 'sharedClientIds', updated);
											}}
										/>
										<Label class="text-sm">{clientId}</Label>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</CardContent>
			</Card>
		{/each}
		
		<!-- Add More Assets -->
		<Card>
			<CardHeader>
				<CardTitle class="text-base">Add Another Asset</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid md:grid-cols-3 gap-3">
					{#each assetCategories as cat}
						{@const CatIcon = cat.icon}
						<button
							onclick={() => addAsset(cat.value)}
							class="p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left flex items-center gap-3"
						>
							<CatIcon class="h-5 w-5 text-primary shrink-0" />
							<div>
								<div class="font-medium text-sm">{cat.label}</div>
								<div class="text-xs text-muted-foreground">{cat.description}</div>
							</div>
						</button>
					{/each}
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
