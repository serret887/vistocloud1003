<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Label } from '$lib/components/ui';
  import { DateInput } from '$lib/components/ui/validated-input';
  import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
  import { Home, AlertCircle } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import type { AddressRecord, AddressType } from '$lib/types/address';
  import { _ } from 'svelte-i18n';
  
  interface Props {
    presentAddress: AddressRecord | undefined;
    onUpdateAddress: (address: AddressType) => void;
    onUpdateDate: (field: 'fromDate' | 'toDate', value: string) => void;
  }
  
  let { presentAddress, onUpdateAddress, onUpdateDate }: Props = $props();
  
  const getMonthsAtAddress = $derived.by(() => {
    const fromDate = presentAddress?.fromDate;
    if (!fromDate) return 0;
    
    const moveInDate = new Date(fromDate);
    const today = new Date();
    const diffTime = today.getTime() - moveInDate.getTime();
    return Math.floor(diffTime / (30.44 * 24 * 60 * 60 * 1000));
  });
  
  const shouldShowWarning = $derived(getMonthsAtAddress > 0 && getMonthsAtAddress < 24);
</script>

<Card>
  <CardHeader>
    <div class="flex items-center gap-2">
      <Home class="h-5 w-5 text-primary" />
      <div>
        <CardTitle>{$_('clientInfo.address.presentAddress')}</CardTitle>
        <CardDescription>{$_('clientInfo.address.presentAddressDescription')}</CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent class="space-y-4">
    <div class="space-y-2">
      <Label>{$_('clientInfo.address.streetAddress')}</Label>
      <AddressAutocomplete
        value={presentAddress?.addr}
        placeholder={$_('clientInfo.address.streetAddressPlaceholder')}
        onchange={onUpdateAddress}
      />
    </div>
    
    <div class="grid md:grid-cols-2 gap-4">
      <DateInput
        label={$_('clientInfo.address.moveInDate')}
        value={presentAddress?.fromDate || ''}
        onValueChange={(val) => onUpdateDate('fromDate', val)}
        required
        allowFuture={false}
      />
      <div class="space-y-2">
        <Label>{$_('clientInfo.address.monthsAtAddress')}</Label>
        <div class={cn(
          "px-3 py-2 text-sm rounded-md border bg-muted",
          shouldShowWarning && "border-warning/50 text-warning-foreground"
        )}>
          {getMonthsAtAddress === 0 
            ? $_('clientInfo.address.enterMoveInDate')
            : getMonthsAtAddress < 24
              ? `${getMonthsAtAddress} ${$_('clientInfo.address.monthsFormerRequired')}`
              : `${getMonthsAtAddress} ${$_('clientInfo.address.months')}`}
        </div>
        {#if shouldShowWarning}
          <p class="text-sm text-warning flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {$_('clientInfo.address.formerAddressesRequired')}
          </p>
        {/if}
      </div>
    </div>
    
    {#if presentAddress?.addr?.formattedAddress}
      <div class="p-3 rounded-lg bg-muted/50 text-sm">
        <div class="font-medium mb-1">{$_('clientInfo.address.resolvedAddress')}</div>
        <div>{presentAddress.addr.formattedAddress}</div>
        {#if presentAddress.addr.city}
          <div class="text-muted-foreground mt-1">
            {presentAddress.addr.city}, {presentAddress.addr.region} {presentAddress.addr.postalCode}
          </div>
        {/if}
      </div>
    {/if}
  </CardContent>
</Card>


