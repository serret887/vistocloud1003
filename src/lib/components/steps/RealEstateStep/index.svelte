<script lang="ts">
  import { applicationStore, activeClientId, activeRealEstateData } from '$lib/stores/application/index';
  import { Card, CardContent, Button } from '$lib/components/ui';
  import { EmptyState } from '$lib/components/shared';
  import ClientTabs from '../ClientTabs.svelte';
  import PropertyCard from './PropertyCard.svelte';
  import { Plus, Building2 } from 'lucide-svelte';
  import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, OCCUPANCY_TYPE_LABELS } from '$lib/types/real-estate';
  import type { AddressType } from '$lib/types/address';
  
  const propertyTypes = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  const propertyStatuses = Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  const occupancyTypes = Object.entries(OCCUPANCY_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  
  const hasRecords = $derived(($activeRealEstateData?.records?.length || 0) > 0);
  const totalPropertyValue = $derived(($activeRealEstateData?.records || []).reduce((sum, r) => sum + (r.propertyValue || 0), 0));
  const totalExpenses = $derived(($activeRealEstateData?.records || []).reduce((sum, r) => sum + (r.monthlyTaxes || 0) + (r.monthlyInsurance || 0), 0));
  
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  
  function addProperty() {
    applicationStore.addRealEstateRecord($activeClientId);
  }
  
  function updateProperty(recordId: string, field: string, value: string | number | boolean | AddressType) {
    applicationStore.updateRealEstateRecord($activeClientId, recordId, { [field]: value });
  }
  
  function removeProperty(recordId: string) {
    applicationStore.removeRealEstateRecord($activeClientId, recordId);
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <ClientTabs />
  
  {#if hasRecords}
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
            <p class="text-2xl font-bold text-primary">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
  
  {#if !hasRecords}
    <Card class="border-dashed">
      <CardContent class="py-12">
        <EmptyState
          icon="🏠"
          title="No Real Estate Owned"
          description="Add properties you currently own or have recently sold"
          actionLabel="Add Property"
          onAction={addProperty}
        />
      </CardContent>
    </Card>
  {:else}
    {#each $activeRealEstateData?.records || [] as property, idx}
      <PropertyCard
        {property}
        index={idx}
        {propertyTypes}
        {propertyStatuses}
        {occupancyTypes}
        onUpdate={(field, value) => updateProperty(property.id, field, value)}
        onRemove={() => removeProperty(property.id)}
      />
    {/each}
    
    <Button onclick={addProperty} variant="secondary" class="gap-2">
      <Plus class="h-4 w-4" />
      Add Another Property
    </Button>
  {/if}
</div>


