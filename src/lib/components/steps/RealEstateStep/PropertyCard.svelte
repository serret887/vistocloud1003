<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Label, Switch } from '$lib/components/ui';
  import { ValidatedSelect, MoneyInput } from '$lib/components/ui/validated-input';
  import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
  import { Trash2, Home } from 'lucide-svelte';
  import type { RealEstateOwned } from '$lib/types/real-estate';
  import type { AddressType } from '$lib/types/address';
  import { _ } from 'svelte-i18n';
  
  interface Props {
    property: RealEstateOwned;
    index: number;
    propertyTypes: { value: string; label: string }[];
    propertyStatuses: { value: string; label: string }[];
    occupancyTypes: { value: string; label: string }[];
    onUpdate: (field: string, value: string | number | boolean | AddressType) => void;
    onRemove: () => void;
  }
  
  let { property, index, propertyTypes, propertyStatuses, occupancyTypes, onUpdate, onRemove }: Props = $props();
  
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  
  const totalExpenses = $derived((property.monthlyTaxes || 0) + (property.monthlyInsurance || 0));
</script>

<Card>
  <CardHeader class="flex flex-row items-start justify-between space-y-0">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Home class="h-5 w-5 text-primary" />
      </div>
      <div>
        <CardTitle class="text-lg">
          {property.address?.formattedAddress || property.address?.address1 || $_('realEstate.property') + ' ' + (index + 1)}
        </CardTitle>
        <CardDescription>
          {property.propertyType || $_('realEstate.propertyTypeNotSpecified')}
          {#if property.currentResidence}
            <span class="text-success"> • {$_('realEstate.currentResidence')}</span>
          {/if}
        </CardDescription>
      </div>
    </div>
    <Button variant="ghost" size="icon" onclick={onRemove}>
      <Trash2 class="h-4 w-4 text-destructive" />
    </Button>
  </CardHeader>
  <CardContent class="space-y-6">
    <div class="space-y-2">
      <Label class="after:content-['*'] after:ml-0.5 after:text-destructive">{$_('realEstate.propertyAddress')}</Label>
      <AddressAutocomplete
        value={property.address}
        placeholder={$_('realEstate.propertyAddressPlaceholder')}
        onchange={(addr) => onUpdate('address', addr)}
      />
    </div>
    
    <div class="grid md:grid-cols-3 gap-4">
      <ValidatedSelect
        label={$_('realEstate.propertyType')}
        value={property.propertyType || undefined}
        onValueChange={(v) => v && onUpdate('propertyType', v)}
        options={propertyTypes}
        placeholder={$_('common.select')}
        required showError={true}
      />
      <ValidatedSelect
        label={$_('realEstate.propertyStatus')}
        value={property.propertyStatus || undefined}
        onValueChange={(v) => v && onUpdate('propertyStatus', v)}
        options={propertyStatuses}
        placeholder={$_('common.select')}
        required showError={true}
      />
      <ValidatedSelect
        label={$_('realEstate.intendedOccupancy')}
        value={property.occupancyType || undefined}
        onValueChange={(v) => v && onUpdate('occupancyType', v)}
        options={occupancyTypes}
        placeholder={$_('common.select')}
        required showError={true}
      />
    </div>
    
    <MoneyInput
      label={$_('realEstate.propertyValue')}
      value={property.propertyValue || 0}
      onValueChange={(val) => onUpdate('propertyValue', val)}
      required
    />
    
    <div class="grid md:grid-cols-2 gap-4">
      <MoneyInput label={$_('realEstate.monthlyPropertyTaxes')} value={property.monthlyTaxes || 0} onValueChange={(v) => onUpdate('monthlyTaxes', v)} />
      <MoneyInput label={$_('realEstate.monthlyInsurance')} value={property.monthlyInsurance || 0} onValueChange={(v) => onUpdate('monthlyInsurance', v)} />
    </div>
    
    <div class="flex items-center justify-between p-4 rounded-lg bg-muted/50">
      <div>
        <Label>{$_('realEstate.currentResidence')}</Label>
        <p class="text-sm text-muted-foreground">{$_('realEstate.currentResidenceDescription')}</p>
      </div>
      <Switch checked={property.currentResidence} onCheckedChange={(c) => onUpdate('currentResidence', c)} />
    </div>
    
    <div class="p-4 rounded-lg border bg-card flex items-center justify-between">
      <span class="text-sm text-muted-foreground">{$_('realEstate.totalMonthlyExpenses')}</span>
      <span class="font-semibold">{formatCurrency(totalExpenses)}</span>
    </div>
  </CardContent>
</Card>


