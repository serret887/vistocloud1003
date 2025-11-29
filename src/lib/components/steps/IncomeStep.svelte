<script lang="ts">
	import { applicationStore, activeClientId, activeIncomeData, activeEmploymentData, currentStepValidationErrors } from '$lib/stores/application';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui';
	import { Input, Label, Button, Textarea } from '$lib/components/ui';
	import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '$lib/components/ui';
	import { ValidatedSelect, MoneyInput } from '$lib/components/ui/validated-input';
	import ValidationErrors from '../ValidationErrors.svelte';
	import { Plus, Briefcase, Trash2, TrendingUp } from 'lucide-svelte';
	import ClientTabs from './ClientTabs.svelte';
	import { PASSIVE_INCOME_TYPE_LABELS, type PassiveIncomeType } from '$lib/types/income';
	import type { PassiveIncomeRecord } from '$lib/types/income';
	import { cn } from '$lib/utils';
	
	const passiveIncomeTypes = Object.entries(PASSIVE_INCOME_TYPE_LABELS).map(([value, label]) => ({
		value: value as PassiveIncomeType,
		label
	}));
	
	function addPassiveIncome() {
		applicationStore.addPassiveIncome($activeClientId);
	}
	
	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
	}
	
	// Filter to only show currently employed records
	let currentEmploymentRecords = $derived(
		($activeEmploymentData?.records || []).filter(emp => emp.currentlyEmployed === true)
	);
	
	// Calculate totals - only include income from currently employed records
	let totalActiveIncome = $derived(
		($activeIncomeData?.activeIncomeRecords || [])
			.filter(rec => {
				// Only include income records that are linked to currently employed positions
				return currentEmploymentRecords.some(emp => emp.id === rec.employmentRecordId);
			})
			.reduce((sum, rec) => {
				return sum + (rec.monthlyAmount || 0) + (rec.bonus || 0) + (rec.commissions || 0) + (rec.overtime || 0);
			}, 0)
	);
	
	let totalPassiveIncome = $derived(
		($activeIncomeData?.passiveIncomeRecords || []).reduce((sum, rec) => sum + (rec.monthlyAmount || 0), 0)
	);
	
	let totalMonthlyIncome = $derived(totalActiveIncome + totalPassiveIncome);
	
	// Helper to check if a field has validation error
	function hasFieldError(fieldPath: string): boolean {
		return $currentStepValidationErrors.some(err => err.field === fieldPath);
	}
	
	// Helper to get error message for a field
	function getFieldError(fieldPath: string): string | null {
		const error = $currentStepValidationErrors.find(err => err.field === fieldPath);
		return error?.message || null;
	}
	
	// Helper to update active income record
	function updateActiveIncome(empId: string, field: string, value: number | string) {
		const incomeRecord = $activeIncomeData?.activeIncomeRecords?.find(r => r.employmentRecordId === empId);
		if (incomeRecord) {
			applicationStore.updateActiveIncomeRecord($activeClientId, incomeRecord.id, { [field]: value });
		} else {
			// Create income record if it doesn't exist
			const recordId = applicationStore.addActiveIncome($activeClientId, empId);
			applicationStore.updateActiveIncomeRecord($activeClientId, recordId, { [field]: value });
		}
		// Re-validate step after updating
		setTimeout(() => applicationStore.revalidateCurrentStep(), 100);
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<ClientTabs />
	
	<!-- Validation Errors -->
	{#if $currentStepValidationErrors.length > 0}
		<ValidationErrors errors={$currentStepValidationErrors} />
	{/if}
	
	<!-- Income Summary Card -->
	<Card class="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
		<CardContent class="py-6">
			<div class="grid md:grid-cols-3 gap-6 text-center">
				<div>
					<p class="text-sm text-muted-foreground">Active Income</p>
					<p class="text-2xl font-bold text-primary">{formatCurrency(totalActiveIncome)}</p>
					<p class="text-xs text-muted-foreground">per month</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Passive Income</p>
					<p class="text-2xl font-bold text-primary">{formatCurrency(totalPassiveIncome)}</p>
					<p class="text-xs text-muted-foreground">per month</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Total Monthly</p>
					<p class="text-2xl font-bold text-success">{formatCurrency(totalMonthlyIncome)}</p>
					<p class="text-xs text-muted-foreground">{formatCurrency(totalMonthlyIncome * 12)}/year</p>
				</div>
			</div>
		</CardContent>
	</Card>
	
	<!-- Active Income (from Employment) -->
	<Card>
		<CardHeader>
			<div class="flex items-center gap-2">
				<Briefcase class="h-5 w-5 text-primary" />
				<div>
					<CardTitle>Employment Income</CardTitle>
					<CardDescription>Income from current and previous employers</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			{#if currentEmploymentRecords.length === 0}
				<div class="text-center py-8">
					<p class="text-muted-foreground">
						No current employment records found. Mark at least one employer as "Currently Employed Here" in the Employment step.
					</p>
					<Button variant="link" class="mt-2">Go to Employment →</Button>
				</div>
			{:else}
				<div class="space-y-6">
					{#each currentEmploymentRecords as emp}
						{@const incomeRecord = $activeIncomeData?.activeIncomeRecords?.find(r => r.employmentRecordId === emp.id)}
						<div class="p-4 rounded-lg border space-y-4">
							<div class="flex items-center justify-between">
								<div>
									<div class="font-medium">{emp.employerName || 'Employer'}</div>
									<div class="text-sm text-muted-foreground">
										{emp.jobTitle || 'Position'} 
										{#if emp.currentlyEmployed}
											<span class="text-success">• Current</span>
										{/if}
									</div>
								</div>
								{#if emp.selfEmployed}
									<span class="text-xs bg-warning/10 text-warning px-2 py-1 rounded">Self-Employed</span>
								{/if}
							</div>
							
							<div class="grid md:grid-cols-4 gap-4">
								<MoneyInput
									label="Base Monthly"
									value={incomeRecord?.monthlyAmount || 0}
									onValueChange={(val) => updateActiveIncome(emp.id, 'monthlyAmount', val)}
									required
									error={hasFieldError(`activeIncome.${currentEmploymentRecords.findIndex(r => r.id === emp.id)}.monthlyAmount`) ? getFieldError(`activeIncome.${currentEmploymentRecords.findIndex(r => r.id === emp.id)}.monthlyAmount`) : undefined}
									showError={true}
									onblur={() => applicationStore.revalidateCurrentStep()}
								/>
								<MoneyInput
									label="Overtime"
									value={incomeRecord?.overtime || 0}
									onValueChange={(val) => updateActiveIncome(emp.id, 'overtime', val)}
								/>
								<MoneyInput
									label="Bonus"
									value={incomeRecord?.bonus || 0}
									onValueChange={(val) => updateActiveIncome(emp.id, 'bonus', val)}
								/>
								<MoneyInput
									label="Commissions"
									value={incomeRecord?.commissions || 0}
									onValueChange={(val) => updateActiveIncome(emp.id, 'commissions', val)}
								/>
							</div>
							
							<div class="space-y-2">
								<Label>Notes</Label>
								<Input
									placeholder="Additional income notes..."
									value={incomeRecord?.notes || ''}
									oninput={(e) => updateActiveIncome(emp.id, 'notes', e.currentTarget.value)}
								/>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
	
	<!-- Passive Income -->
	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0">
			<div class="flex items-center gap-2">
				<TrendingUp class="h-5 w-5 text-primary" />
				<div>
					<CardTitle>Other Income Sources</CardTitle>
					<CardDescription>Non-employment income (Social Security, pension, etc.)</CardDescription>
				</div>
			</div>
			<Button variant="outline" size="sm" onclick={addPassiveIncome} class="gap-2">
				<Plus class="h-4 w-4" />
				Add Income Source
			</Button>
		</CardHeader>
		<CardContent>
			{#if ($activeIncomeData?.passiveIncomeRecords?.length || 0) === 0}
				<div class="text-center py-8 text-muted-foreground">
					<p>No other income sources added.</p>
					<p class="text-sm mt-1">Add if you receive income from Social Security, pension, investments, etc.</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each $activeIncomeData?.passiveIncomeRecords || [] as income, idx}
						{@const sourceTypeValue = income.sourceType || undefined}
						<div class="p-4 rounded-lg border space-y-4">
							<div class="flex items-center justify-between">
								<span class="font-medium">Income Source {idx + 1}</span>
								<Button variant="ghost" size="icon">
									<Trash2 class="h-4 w-4 text-destructive" />
								</Button>
							</div>
							
							<div class="grid md:grid-cols-3 gap-4">
								<ValidatedSelect
									label="Source Type"
									value={sourceTypeValue}
									onValueChange={(value) => {
										if (value !== undefined && value !== null) {
											applicationStore.updatePassiveIncomeRecord($activeClientId, income.id, { sourceType: value as PassiveIncomeType });
										}
									}}
									options={passiveIncomeTypes}
									placeholder="Select type..."
									required
									showError={true}
								/>
								<div class="space-y-2">
									<Label>Source Name</Label>
									<Input 
										value={income.sourceName} 
										placeholder="e.g., SSA, Company Pension" 
									/>
								</div>
								<MoneyInput
									label="Monthly Amount"
									value={income.monthlyAmount || 0}
									onValueChange={(val) => {
										applicationStore.updatePassiveIncomeRecord($activeClientId, income.id, { monthlyAmount: val });
										setTimeout(() => applicationStore.revalidateCurrentStep(), 100);
									}}
									required
								/>
							</div>
							
							<div class="space-y-2">
								<Label>Notes</Label>
								<Input
									placeholder="Additional notes about this income..."
									value={income.notes || ''}
								/>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
