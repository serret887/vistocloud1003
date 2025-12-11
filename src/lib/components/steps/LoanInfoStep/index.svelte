<script lang="ts">
  import { applicationStore, activeClientId, activeLoanData, activeRealEstateData } from '$lib/stores/application/index';
  import { Card, CardHeader, CardTitle, CardContent, Label } from '$lib/components/ui';
  import { ValidatedSelect, MoneyInput, ValidatedInput } from '$lib/components/ui/validated-input';
  import AddressAutocomplete from '$lib/components/ui/address-autocomplete.svelte';
  import { Switch } from '$lib/components/ui';
  import ClientTabs from '../ClientTabs.svelte';
  import { _ } from 'svelte-i18n';
  import { get } from 'svelte/store';
  import type { LoanPurposeType, MortgageType } from '$lib/types/loan';
  import type { AddressType } from '$lib/types/address';
  import { LOAN_PURPOSE_TYPE_LABELS, MORTGAGE_TYPE_LABELS } from '$lib/types/loan';
  import { Home, DollarSign, Building2, Percent, MapPin } from 'lucide-svelte';
  
  const loanInfo = $derived($activeLoanData?.loanInfo);
  const realEstateRecords = $derived($activeRealEstateData?.records || []);
  
  // Filter properties that are retained (not sold) for refinance selection
  const availableProperties = $derived(
    realEstateRecords.filter(prop => prop.propertyStatus === 'Retained')
  );
  
  const isRefinanceType = $derived(
    loanInfo?.loanPurposeType === 'Refinance' || 
    loanInfo?.loanPurposeType === 'CashOutRefinance'
  );
  
  const isPurchaseType = $derived(
    loanInfo?.loanPurposeType === 'Purchase'
  );
  
  const loanPurposeOptions = $derived.by(() => {
    return Object.entries(LOAN_PURPOSE_TYPE_LABELS).map(([value, label]) => ({
      value: value as LoanPurposeType,
      label: label // Use labels directly, don't translate loan purpose types
    }));
  });
  
  const mortgageTypeOptions = $derived.by(() => {
    const t = get(_);
    return Object.entries(MORTGAGE_TYPE_LABELS).map(([value, label]) => ({
      value: value as MortgageType,
      label: t(`loanInfo.mortgageTypes.${value}`) || label
    }));
  });
  
  const propertyUseOptions = $derived.by(() => {
    const t = get(_);
    return [
      { value: 'PrimaryResidence', label: t('loanInfo.propertyUseTypes.primaryResidence') || 'Primary Residence' },
      { value: 'SecondaryResidence', label: t('loanInfo.propertyUseTypes.secondaryResidence') || 'Secondary Residence' },
      { value: 'Investment', label: t('loanInfo.propertyUseTypes.investment') || 'Investment' }
    ];
  });
  
  function formatPropertyAddress(property: any): string {
    const addr = property.address;
    if (addr?.formattedAddress) return addr.formattedAddress;
    if (addr?.address1) {
      return `${addr.address1}${addr.city ? `, ${addr.city}` : ''}${addr.state ? `, ${addr.state}` : ''}`;
    }
    return `Property ${property.id.slice(-4)}`;
  }
  
  function updateLoanPurpose(purpose: LoanPurposeType) {
    applicationStore.setLoanPurposeType($activeClientId, purpose);
    // Clear refinance property if switching away from refinance types
    if (purpose !== 'Refinance' && purpose !== 'CashOutRefinance') {
      applicationStore.setRefinancePropertyId($activeClientId, null);
    }
  }
  
  function updateMortgageType(mortgageType: MortgageType) {
    applicationStore.setMortgageType($activeClientId, mortgageType);
  }
  
  function updateRefinanceProperty(propertyId: string | null) {
    applicationStore.setRefinancePropertyId($activeClientId, propertyId);
  }
  
  function updateLoanAmount(amount: number | null) {
    applicationStore.setLoanAmount($activeClientId, amount);
  }
  
  function updateDownPayment(amount: number | null) {
    applicationStore.setDownPayment($activeClientId, amount);
  }
  
  function updateDownPaymentSource(source: string) {
    applicationStore.setDownPaymentSource($activeClientId, source || null);
  }
  
  function updatePropertyUseType(useType: 'PrimaryResidence' | 'SecondaryResidence' | 'Investment' | null) {
    applicationStore.setPropertyUseType($activeClientId, useType);
  }
  
  function updatePurchasePropertyAddress(address: AddressType | null) {
    applicationStore.setPurchasePropertyAddress($activeClientId, address);
  }
  
  function updatePurchasePropertyAddressTBD(tbd: boolean) {
    applicationStore.setPurchasePropertyAddressTBD($activeClientId, tbd);
  }
  
  function updateAmountOwed(amount: number | null) {
    applicationStore.setAmountOwed($activeClientId, amount);
  }
  
  function updateInterestRate(rate: number | null) {
    applicationStore.setInterestRate($activeClientId, rate);
  }
  
  function updateEstimatedTaxes(taxes: number | null) {
    applicationStore.setEstimatedTaxes($activeClientId, taxes);
  }
  
  function updateEstimatedInsurance(insurance: number | null) {
    applicationStore.setEstimatedInsurance($activeClientId, insurance);
  }
  
  function formatAddress(address: AddressType | null): string {
    if (!address) return '';
    if (address.formattedAddress) return address.formattedAddress;
    return `${address.address1 || ''}${address.city ? `, ${address.city}` : ''}${address.state ? `, ${address.state}` : ''}${address.zip ? ` ${address.zip}` : ''}`.trim();
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <ClientTabs />
  
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <DollarSign class="h-5 w-5 text-primary" />
        {$_('loanInfo.title')}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Loan Purpose Type -->
          <div class="space-y-2">
            <ValidatedSelect
              label={$_('loanInfo.loanPurposeType')}
              value={loanInfo?.loanPurposeType || undefined}
              options={loanPurposeOptions}
              placeholder={$_('loanInfo.selectLoanPurpose')}
              onValueChange={(value) => value && updateLoanPurpose(value as LoanPurposeType)}
              required
              showError={true}
            />
            <p class="text-xs text-muted-foreground">
              {$_('loanInfo.loanPurposeTypeDescription')}
            </p>
          </div>
          
          <!-- Mortgage Type -->
          <div class="space-y-2">
            <ValidatedSelect
              label={$_('loanInfo.mortgageType')}
              value={loanInfo?.mortgageType || undefined}
              options={mortgageTypeOptions}
              placeholder={$_('loanInfo.selectMortgageType')}
              onValueChange={(value) => value && updateMortgageType(value as MortgageType)}
              required
              showError={true}
            />
            <p class="text-xs text-muted-foreground">
              {$_('loanInfo.mortgageTypeDescription')}
            </p>
          </div>
          
          <!-- Property Use Type -->
          <div class="space-y-2">
            <ValidatedSelect
              label={$_('loanInfo.propertyUseType')}
              value={loanInfo?.propertyUseType || undefined}
              options={propertyUseOptions}
              placeholder={$_('loanInfo.selectPropertyUseType')}
              onValueChange={(value) => updatePropertyUseType(value as 'PrimaryResidence' | 'SecondaryResidence' | 'Investment' | null)}
              required
              showError={true}
            />
            <p class="text-xs text-muted-foreground">
              {$_('loanInfo.propertyUseTypeDescription')}
            </p>
          </div>
        </div>
        
        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Loan Amount -->
          <div class="space-y-2">
            <MoneyInput
              label={$_('loanInfo.loanAmount')}
              value={loanInfo?.loanAmount || 0}
              onValueChange={(val) => updateLoanAmount(val || null)}
              required
            />
            <p class="text-xs text-muted-foreground">
              {$_('loanInfo.loanAmountDescription')}
            </p>
          </div>
          
          <!-- Purchase Price (only for Purchase) -->
          {#if isPurchaseType}
            <div class="space-y-2">
              <MoneyInput
                label={$_('loanInfo.purchasePrice')}
                value={loanInfo?.amountOwed || 0}
                onValueChange={(val) => updateAmountOwed(val || null)}
                required
              />
              <p class="text-xs text-muted-foreground">
                {$_('loanInfo.purchasePriceDescription')}
              </p>
            </div>
          {:else}
            <!-- Amount Owed (for Refinance/Other) -->
            <div class="space-y-2">
              <MoneyInput
                label={$_('loanInfo.amountOwed')}
                value={loanInfo?.amountOwed || 0}
                onValueChange={(val) => updateAmountOwed(val || null)}
                required
              />
              <p class="text-xs text-muted-foreground">
                {#if isRefinanceType}
                  {$_('loanInfo.amountOwedDescriptionRefinance')}
                {:else}
                  {$_('loanInfo.amountOwedDescription')}
                {/if}
              </p>
            </div>
          {/if}
          
          <!-- Interest Rate -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div class="flex-1">
                <ValidatedInput
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  max="100"
                  label={$_('loanInfo.interestRate')}
                  value={loanInfo?.interestRate?.toString() || ''}
                  placeholder={$_('loanInfo.interestRatePlaceholder')}
                  onValueChange={(value) => {
                    const numValue = value ? parseFloat(value) : null;
                    updateInterestRate(numValue);
                  }}
                />
              </div>
              <span class="text-muted-foreground text-sm pt-2">%</span>
            </div>
            <p class="text-xs text-muted-foreground">
              {$_('loanInfo.interestRateDescription')}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Refinance Property Selection (only for Refinance/Cash-Out Refinance) - Full Width -->
      {#if isRefinanceType}
        <div class="mt-6 space-y-2 p-4 bg-muted/50 rounded-lg border">
          <Label class="after:content-['*'] after:ml-0.5 after:text-destructive flex items-center gap-2">
            <Building2 class="h-4 w-4" />
            {$_('loanInfo.refinanceProperty')}
          </Label>
          {#if availableProperties.length === 0}
            <div class="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
              <p class="text-sm">
                {$_('loanInfo.noPropertiesAvailable')}
              </p>
              <p class="text-xs mt-1">
                {$_('loanInfo.addPropertyInRealEstateStep')}
              </p>
            </div>
          {:else}
            <ValidatedSelect
              label={$_('loanInfo.refinanceProperty')}
              value={loanInfo?.refinancePropertyId || undefined}
              options={availableProperties.map(prop => ({
                value: prop.id,
                label: formatPropertyAddress(prop)
              }))}
              placeholder={$_('loanInfo.selectRefinanceProperty')}
              onValueChange={(value) => updateRefinanceProperty(value || null)}
              required
              showError={true}
            />
            {#if loanInfo?.refinancePropertyId}
              {@const selectedProperty = availableProperties.find(p => p.id === loanInfo.refinancePropertyId)}
              {#if selectedProperty}
                <div class="mt-2 p-3 bg-background rounded border">
                  <div class="flex items-start gap-2">
                    <Home class="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium">{formatPropertyAddress(selectedProperty)}</p>
                      <p class="text-xs text-muted-foreground mt-1">
                        {selectedProperty.propertyType} • {selectedProperty.occupancyType}
                        {#if selectedProperty.propertyValue}
                          • {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedProperty.propertyValue)}
                        {/if}
                      </p>
                    </div>
                  </div>
                </div>
              {/if}
            {/if}
          {/if}
          <p class="text-xs text-muted-foreground">
            {$_('loanInfo.refinancePropertyDescription')}
          </p>
        </div>
      {/if}
      
      <!-- Purchase Property Address (only for Purchase) - Full Width -->
      {#if isPurchaseType}
        <div class="mt-6 space-y-2 p-4 bg-muted/50 rounded-lg border">
          <Label class="after:content-['*'] after:ml-0.5 after:text-destructive flex items-center gap-2">
            <MapPin class="h-4 w-4" />
            {$_('loanInfo.purchasePropertyAddress')}
          </Label>
          
          <div class="flex items-center gap-3 mb-3">
            <Switch 
              checked={loanInfo?.purchasePropertyAddressTBD || false}
              onCheckedChange={(checked) => updatePurchasePropertyAddressTBD(checked)}
            />
            <Label class="font-normal cursor-pointer" onclick={() => updatePurchasePropertyAddressTBD(!loanInfo?.purchasePropertyAddressTBD)}>
              {$_('loanInfo.markAddressAsTBD')}
            </Label>
          </div>
          
          {#if !loanInfo?.purchasePropertyAddressTBD}
            <AddressAutocomplete
              value={loanInfo?.purchasePropertyAddress || null}
              placeholder={$_('loanInfo.purchasePropertyAddressPlaceholder')}
              onchange={(addr) => updatePurchasePropertyAddress(addr)}
            />
            {#if loanInfo?.purchasePropertyAddress}
              <div class="mt-2 p-3 bg-background rounded border">
                <p class="text-sm font-medium">{formatAddress(loanInfo.purchasePropertyAddress)}</p>
              </div>
            {/if}
          {:else}
            <div class="p-3 bg-background rounded border border-dashed">
              <p class="text-sm text-muted-foreground italic">{$_('loanInfo.addressMarkedAsTBD')}</p>
            </div>
          {/if}
          
          <p class="text-xs text-muted-foreground">
            {$_('loanInfo.purchasePropertyAddressDescription')}
          </p>
        </div>
      {/if}
      
      <!-- Down Payment Section (only for Purchase) - Full Width -->
      {#if isPurchaseType}
        <div class="mt-6 space-y-4 p-4 bg-muted/50 rounded-lg border">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <MoneyInput
                label={$_('loanInfo.downPayment')}
                value={loanInfo?.downPayment || 0}
                onValueChange={(val) => updateDownPayment(val || null)}
                required
              />
              <p class="text-xs text-muted-foreground">
                {$_('loanInfo.downPaymentDescription')}
              </p>
            </div>
            
            <div class="space-y-2">
              <ValidatedInput
                type="text"
                label={$_('loanInfo.downPaymentSource')}
                value={loanInfo?.downPaymentSource || ''}
                placeholder={$_('loanInfo.downPaymentSourcePlaceholder')}
                required
                onValueChange={(value) => updateDownPaymentSource(value)}
              />
              <p class="text-xs text-muted-foreground">
                {$_('loanInfo.downPaymentSourceDescription')}
              </p>
            </div>
          </div>
          
          <!-- Estimated Taxes and Insurance for Purchase -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div class="space-y-2">
              <MoneyInput
                label={$_('loanInfo.estimatedTaxes')}
                value={loanInfo?.estimatedTaxes || 0}
                required
                onValueChange={(val) => updateEstimatedTaxes(val || null)}
              />
              <p class="text-xs text-muted-foreground">
                {$_('loanInfo.estimatedTaxesDescription')}
              </p>
            </div>
            
            <div class="space-y-2">
              <MoneyInput
                label={$_('loanInfo.estimatedInsurance')}
                value={loanInfo?.estimatedInsurance || 0}
                required
                onValueChange={(val) => updateEstimatedInsurance(val || null)}
              />
              <p class="text-xs text-muted-foreground">
                {$_('loanInfo.estimatedInsuranceDescription')}
              </p>
            </div>
          </div>
        </div>
      {/if}
    </CardContent>
  </Card>
</div>

