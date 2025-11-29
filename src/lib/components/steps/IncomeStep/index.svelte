<script lang="ts">
  import { applicationStore, activeClientId, activeIncomeData, activeEmploymentData, currentStepValidationErrors } from '$lib/stores/application';
  import ValidationErrors from '../../ValidationErrors.svelte';
  import ClientTabs from '../ClientTabs.svelte';
  import IncomeSummary from './IncomeSummary.svelte';
  import ActiveIncomeCard from './ActiveIncomeCard.svelte';
  import PassiveIncomeCard from './PassiveIncomeCard.svelte';
  import type { PassiveIncomeRecord } from '$lib/types/income';
  
  // Filter to only show currently employed records
  const currentEmploymentRecords = $derived(
    ($activeEmploymentData?.records || []).filter(emp => emp.currentlyEmployed === true)
  );
  
  // Calculate totals
  const totalActiveIncome = $derived(
    ($activeIncomeData?.activeIncomeRecords || [])
      .filter(rec => currentEmploymentRecords.some(emp => emp.id === rec.employmentRecordId))
      .reduce((sum, rec) => sum + (rec.monthlyAmount || 0) + (rec.bonus || 0) + (rec.commissions || 0) + (rec.overtime || 0), 0)
  );
  
  const totalPassiveIncome = $derived(
    ($activeIncomeData?.passiveIncomeRecords || []).reduce((sum, rec) => sum + (rec.monthlyAmount || 0), 0)
  );
  
  function updateActiveIncome(empId: string, field: string, value: number | string) {
    const incomeRecord = $activeIncomeData?.activeIncomeRecords?.find(r => r.employmentRecordId === empId);
    if (incomeRecord) {
      applicationStore.updateActiveIncomeRecord($activeClientId, incomeRecord.id, { [field]: value });
    } else {
      const recordId = applicationStore.addActiveIncome($activeClientId, empId);
      applicationStore.updateActiveIncomeRecord($activeClientId, recordId, { [field]: value });
    }
    // Clear field error when value provided
    const empIndex = currentEmploymentRecords.findIndex(e => e.id === empId);
    if (empIndex >= 0 && value) {
      applicationStore.clearFieldError(`income.${empIndex}.${field}`);
    }
  }
  
  function addPassiveIncome() {
    applicationStore.addPassiveIncome($activeClientId);
  }
  
  function updatePassiveIncome(recordId: string, updates: Partial<PassiveIncomeRecord>) {
    applicationStore.updatePassiveIncomeRecord($activeClientId, recordId, updates);
    // Clear errors for updated fields
    const records = $activeIncomeData?.passiveIncomeRecords || [];
    const idx = records.findIndex(r => r.id === recordId);
    if (idx >= 0) {
      Object.keys(updates).forEach(key => {
        if ((updates as Record<string, unknown>)[key]) {
          applicationStore.clearFieldError(`passiveIncome.${idx}.${key}`);
        }
      });
    }
  }
  
  function hasFieldError(fieldPath: string): boolean {
    return $currentStepValidationErrors.some(err => err.field === fieldPath);
  }
  
  function getFieldError(fieldPath: string): string | null {
    return $currentStepValidationErrors.find(err => err.field === fieldPath)?.message || null;
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <ClientTabs />
  
  {#if $currentStepValidationErrors.length > 0}
    <ValidationErrors errors={$currentStepValidationErrors} />
  {/if}
  
  <IncomeSummary activeIncome={totalActiveIncome} passiveIncome={totalPassiveIncome} />
  
  <ActiveIncomeCard
    employmentRecords={currentEmploymentRecords}
    incomeRecords={$activeIncomeData?.activeIncomeRecords || []}
    onUpdateIncome={updateActiveIncome}
    {hasFieldError}
    {getFieldError}
  />
  
  <PassiveIncomeCard
    records={$activeIncomeData?.passiveIncomeRecords || []}
    onAdd={addPassiveIncome}
    onUpdate={updatePassiveIncome}
  />
</div>


