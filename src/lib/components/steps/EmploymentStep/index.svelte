<script lang="ts">
  import { applicationStore, activeClientId, activeEmploymentData, currentStepValidationErrors } from '$lib/stores/application';
  import { Card, CardContent, Button } from '$lib/components/ui';
  import { EmptyState } from '$lib/components/shared';
  import ValidationErrors from '../../ValidationErrors.svelte';
  import ClientTabs from '../ClientTabs.svelte';
  import EmploymentCard from './EmploymentCard.svelte';
  import { Plus, Building2, AlertTriangle } from 'lucide-svelte';
  import type { AddressType } from '$lib/types/address';
  
  function addEmployment() {
    applicationStore.addEmploymentRecord($activeClientId);
  }
  
  function updateRecord(recordId: string, index: number, field: string, value: string | boolean | number | AddressType) {
    const updates: Record<string, string | boolean | number | AddressType> = { [field]: value };
    
    // When selfEmployed is toggled OFF, also reset ownershipPercentage to false
    if (field === 'selfEmployed' && value === false) {
      updates.ownershipPercentage = false;
    }
    
    applicationStore.updateEmploymentRecord($activeClientId, recordId, updates);
    
    // Clear the field error when user provides a value
    const fieldPath = `employment.${index}.${field}`;
    console.log(`📝 [EMP-UPDATE] Field: "${field}", Index: ${index}, Value:`, value, `→ clearFieldError("${fieldPath}")`);
    if (value) {
      applicationStore.clearFieldError(fieldPath);
    }
  }
  
  function removeRecord(recordId: string) {
    applicationStore.removeEmploymentRecord($activeClientId, recordId);
  }
  
  // Calculate total employment coverage
  const coverageMonths = $derived.by(() => {
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
  });
  
  const needsMoreHistory = $derived(coverageMonths < 24);
  const hasRecords = $derived(($activeEmploymentData?.records?.length || 0) > 0);
  
  function hasFieldError(fieldPath: string): boolean {
    const hasError = $currentStepValidationErrors.some(err => err.field === fieldPath);
    if (hasError) {
      console.log(`⚠️ [HAS-ERROR] Field "${fieldPath}" has error. Current errors:`, $currentStepValidationErrors.map(e => e.field));
    }
    return hasError;
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
  
  {#if needsMoreHistory && hasRecords}
    <div class="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
      <AlertTriangle class="h-5 w-5 text-warning shrink-0" />
      <div class="text-sm">
        <span class="font-medium">Employment history gap:</span> 
        Currently showing {coverageMonths} months. Please add at least 24 months of employment history.
      </div>
    </div>
  {/if}
  
  {#if !hasRecords}
    <Card class="border-dashed">
      <CardContent class="py-12">
        <EmptyState
          icon="🏢"
          title="No Employment Records"
          description="Add employment history for the past 2 years"
          actionLabel="Add Employer"
          onAction={addEmployment}
        />
      </CardContent>
    </Card>
  {:else}
    {#each $activeEmploymentData?.records || [] as record, idx}
      <EmploymentCard
        {record}
        index={idx}
        onUpdate={(field, value) => updateRecord(record.id, idx, field, value)}
        onRemove={() => removeRecord(record.id)}
        {hasFieldError}
        {getFieldError}
      />
    {/each}
    
    <Button onclick={addEmployment} variant="secondary" class="gap-2">
      <Plus class="h-4 w-4" />
      Add Another Employer
    </Button>
  {/if}
</div>


