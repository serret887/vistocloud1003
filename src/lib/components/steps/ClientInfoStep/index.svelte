<script lang="ts">
  import { applicationStore, activeClientId, activeClientData, activeAddressData, currentStepValidationErrors } from '$lib/stores/application';
  import ValidationErrors from '../../ValidationErrors.svelte';
  import ClientTabs from '../ClientTabs.svelte';
  import PersonalInfo from './PersonalInfo.svelte';
  import PresentAddress from './PresentAddress.svelte';
  import FormerAddresses from './FormerAddresses.svelte';
  import MailingAddress from './MailingAddress.svelte';
  import type { AddressType, AddressRecord } from '$lib/types/address';
  
  function updateField(field: string, value: string | boolean) {
    applicationStore.updateClientData($activeClientId, { [field]: value });
    if (value) applicationStore.clearFieldError(field);
  }
  
  function updatePresentAddress(address: AddressType) {
    applicationStore.updatePresentAddress($activeClientId, { addr: address });
    if (address?.streetAddress) applicationStore.clearFieldError('present.address');
  }
  
  function updatePresentAddressDate(field: 'fromDate' | 'toDate', value: string) {
    applicationStore.updatePresentAddress($activeClientId, { [field]: value });
    if (value) applicationStore.clearFieldError(`present.${field}`);
  }
  
  function addFormerAddress() {
    applicationStore.addFormerAddress($activeClientId);
  }
  
  function updateFormerAddress(addressId: string, updates: Partial<AddressRecord>) {
    applicationStore.updateFormerAddress($activeClientId, addressId, updates);
    // Clear errors for updated fields
    const formerAddresses = $activeAddressData?.former || [];
    const idx = formerAddresses.findIndex(a => a.id === addressId);
    if (idx >= 0) {
      Object.keys(updates).forEach(key => {
        if ((updates as Record<string, unknown>)[key]) {
          applicationStore.clearFieldError(`former.${idx}.${key}`);
        }
      });
    }
  }
  
  function updateMailingAddress(address: AddressType) {
    applicationStore.updateMailingAddress($activeClientId, { addr: address });
    if (address?.streetAddress) applicationStore.clearFieldError('mailing.address');
  }
  
  // Calculate if former addresses are needed
  const shouldShowFormerAddresses = $derived.by(() => {
    const fromDate = $activeAddressData?.present?.fromDate;
    if (!fromDate) return false;
    
    const moveInDate = new Date(fromDate);
    const today = new Date();
    const diffTime = today.getTime() - moveInDate.getTime();
    const months = diffTime / (30.44 * 24 * 60 * 60 * 1000);
    
    return months > 0 && months < 24;
  });
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <ClientTabs />
  
  {#if $currentStepValidationErrors.length > 0}
    <ValidationErrors errors={$currentStepValidationErrors} />
  {/if}
  
  <PersonalInfo clientData={$activeClientData} onUpdate={updateField} />
  
  <PresentAddress 
    presentAddress={$activeAddressData?.present}
    onUpdateAddress={updatePresentAddress}
    onUpdateDate={updatePresentAddressDate}
  />
  
  {#if shouldShowFormerAddresses}
    <FormerAddresses 
      formerAddresses={$activeAddressData?.former || []}
      onAddAddress={addFormerAddress}
      onUpdateAddress={updateFormerAddress}
    />
  {/if}
  
  <MailingAddress 
    mailingAddress={$activeAddressData?.mailing}
    onUpdateAddress={updateMailingAddress}
  />
</div>


