<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '$lib/components/ui';
  import { DateInput } from '$lib/components/ui/validated-input';
  import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
  import { Plus, Trash2, AlertCircle } from 'lucide-svelte';
  import type { AddressRecord, AddressType } from '$lib/types/address';
  import { _ } from 'svelte-i18n';
  
  interface Props {
    formerAddresses: AddressRecord[];
    onAddAddress: () => void;
    onUpdateAddress: (addressId: string, updates: Partial<AddressRecord>) => void;
    onRemoveAddress?: (addressId: string) => void;
  }
  
  let { formerAddresses, onAddAddress, onUpdateAddress, onRemoveAddress }: Props = $props();
</script>

<Card>
  <CardHeader class="flex flex-row items-center justify-between space-y-0">
    <div>
      <CardTitle>{$_('clientInfo.address.formerAddresses')}</CardTitle>
      <CardDescription>{$_('clientInfo.address.formerAddressesDescription')}</CardDescription>
    </div>
    <Button variant="outline" size="sm" onclick={onAddAddress} class="gap-2">
      <Plus class="h-4 w-4" />
      {$_('clientInfo.address.addFormerAddress')}
    </Button>
  </CardHeader>
  <CardContent>
    {#if formerAddresses.length === 0}
      <p class="text-warning text-center py-6 flex items-center justify-center gap-2">
        <AlertCircle class="h-4 w-4" />
        {$_('clientInfo.address.mustAddFormerAddress')}
      </p>
    {:else}
      <div class="space-y-4">
        {#each formerAddresses as addr, idx}
          <div class="p-4 rounded-lg border space-y-4">
            <div class="flex items-center justify-between">
              <span class="font-medium">{$_('clientInfo.address.formerAddress')} {idx + 1}</span>
              {#if onRemoveAddress}
                <Button variant="ghost" size="icon" onclick={() => onRemoveAddress?.(addr.id)}>
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              {/if}
            </div>
            <AddressAutocomplete
              value={addr.addr}
              placeholder={$_('clientInfo.address.formerAddressPlaceholder')}
              onchange={(address) => onUpdateAddress(addr.id, { addr: address })}
            />
            <div class="grid md:grid-cols-2 gap-4">
              <DateInput
                label={$_('clientInfo.address.fromDate')}
                value={addr.fromDate || ''}
                onValueChange={(val) => onUpdateAddress(addr.id, { fromDate: val })}
                required
                allowFuture={false}
              />
              <DateInput
                label={$_('clientInfo.address.toDate')}
                value={addr.toDate || ''}
                onValueChange={(val) => onUpdateAddress(addr.id, { toDate: val })}
                required
                allowFuture={false}
              />
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </CardContent>
</Card>


