<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Checkbox, Label } from '$lib/components/ui';
  import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
  import { Mail } from 'lucide-svelte';
  import type { AddressRecord, AddressType } from '$lib/types/address';
  import { _ } from 'svelte-i18n';
  
  interface Props {
    mailingAddress: AddressRecord | undefined;
    onUpdateAddress: (address: AddressType) => void;
  }
  
  let { mailingAddress, onUpdateAddress }: Props = $props();
  let useMailingAddress = $state(false);
</script>

<Card>
  <CardHeader>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Mail class="h-5 w-5 text-primary" />
        <div>
          <CardTitle>{$_('clientInfo.address.mailingAddress')}</CardTitle>
          <CardDescription>{$_('clientInfo.address.mailingAddressDescription')}</CardDescription>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox
          checked={!useMailingAddress}
          onCheckedChange={(checked) => useMailingAddress = !checked}
        />
        <Label class="text-sm">{$_('clientInfo.address.sameAsPresent')}</Label>
      </div>
    </div>
  </CardHeader>
  {#if useMailingAddress}
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label>{$_('clientInfo.address.mailingAddress')}</Label>
        <AddressAutocomplete
          value={mailingAddress?.addr}
          placeholder={$_('clientInfo.address.mailingAddressPlaceholder')}
          onchange={onUpdateAddress}
        />
      </div>
    </CardContent>
  {/if}
</Card>


