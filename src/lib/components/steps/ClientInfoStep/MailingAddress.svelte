<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Checkbox, Label } from '$lib/components/ui';
  import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
  import { Mail } from 'lucide-svelte';
  import type { AddressRecord, AddressType } from '$lib/types/address';
  
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
          value={mailingAddress?.addr}
          placeholder="Start typing mailing address..."
          onchange={onUpdateAddress}
        />
      </div>
    </CardContent>
  {/if}
</Card>


