<script lang="ts">
  import { applicationStore, activeClientId, activeAssetsData, clientIds } from '$lib/stores/application';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
  import { EmptyState } from '$lib/components/shared';
  import ClientTabs from '../ClientTabs.svelte';
  import AssetCard from './AssetCard.svelte';
  import { Wallet, Building, TrendingUp, PiggyBank, Gift } from 'lucide-svelte';
  import type { AssetCategory } from '$lib/types/assets';
  
  const assetCategories: { value: AssetCategory; label: string; icon: any; description: string }[] = [
    { value: 'BankAccount', label: 'Bank Account', icon: Building, description: 'Checking, Savings, Money Market' },
    { value: 'StocksAndBonds', label: 'Stocks & Bonds', icon: TrendingUp, description: 'Stocks, Bonds, Mutual Funds' },
    { value: 'LifeInsurance', label: 'Life Insurance', icon: Wallet, description: 'Cash value of life insurance' },
    { value: 'RetirementFund', label: 'Retirement Fund', icon: PiggyBank, description: '401k, IRA, Pension' },
    { value: 'Gift', label: 'Gift', icon: Gift, description: 'Gifted funds for down payment' },
    { value: 'Other', label: 'Other', icon: Wallet, description: 'Other assets' }
  ];
  
  const accountTypes: Record<AssetCategory, { value: string; label: string }[]> = {
    'BankAccount': [{ value: 'Checking', label: 'Checking' }, { value: 'Savings', label: 'Savings' }, { value: 'Money Market', label: 'Money Market' }, { value: 'CD', label: 'CD' }],
    'StocksAndBonds': [{ value: 'Stocks', label: 'Stocks' }, { value: 'Bonds', label: 'Bonds' }, { value: 'Mutual Funds', label: 'Mutual Funds' }, { value: 'ETFs', label: 'ETFs' }],
    'LifeInsurance': [{ value: 'Whole Life', label: 'Whole Life' }, { value: 'Universal Life', label: 'Universal Life' }],
    'RetirementFund': [{ value: '401k', label: '401k' }, { value: 'IRA', label: 'IRA' }, { value: 'Roth IRA', label: 'Roth IRA' }, { value: 'Pension', label: 'Pension' }],
    'Gift': [{ value: 'Family Gift', label: 'Family Gift' }, { value: 'Employer Gift', label: 'Employer Gift' }],
    'Other': [{ value: 'Other', label: 'Other' }]
  };
  
  const totalAssets = $derived(($activeAssetsData?.records || []).reduce((sum, rec) => sum + (rec.amount || 0), 0));
  const hasRecords = $derived(($activeAssetsData?.records?.length || 0) > 0);
  
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  
  function getCategoryInfo(category: AssetCategory) {
    return assetCategories.find(c => c.value === category) || assetCategories[5];
  }
  
  function addAsset(category: AssetCategory) {
    applicationStore.addAssetRecord($activeClientId, category);
  }
  
  function updateAsset(recordId: string, field: string, value: string | number | string[]) {
    applicationStore.updateAssetRecord($activeClientId, recordId, { [field]: value });
    // Clear field error when value provided
    const records = $activeAssetsData?.records || [];
    const idx = records.findIndex(r => r.id === recordId);
    if (idx >= 0 && value) {
      applicationStore.clearFieldError(`assets.${idx}.${field}`);
    }
  }
  
  function removeAsset(recordId: string) {
    applicationStore.removeAssetRecord($activeClientId, recordId);
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <ClientTabs />
  
  <Card class="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
    <CardContent class="py-6 text-center">
      <p class="text-sm text-muted-foreground">Total Assets</p>
      <p class="text-3xl font-bold text-success">{formatCurrency(totalAssets)}</p>
    </CardContent>
  </Card>
  
  {#if !hasRecords}
    <Card class="border-dashed">
      <CardContent class="py-12">
        <div class="text-center space-y-4">
          <EmptyState icon="💰" title="No Assets Added" description="Add your assets to complete the application" />
          <div class="grid md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {#each assetCategories as cat}
              {@const Icon = cat.icon}
              <button onclick={() => addAsset(cat.value)} class="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left">
                <Icon class="h-5 w-5 text-primary mb-2" />
                <div class="font-medium text-sm">{cat.label}</div>
                <div class="text-xs text-muted-foreground">{cat.description}</div>
              </button>
            {/each}
          </div>
        </div>
      </CardContent>
    </Card>
  {:else}
    {#each $activeAssetsData?.records || [] as asset}
      <AssetCard
        {asset}
        categoryInfo={getCategoryInfo(asset.category)}
        accountTypes={accountTypes[asset.category] || []}
        clientIds={$clientIds}
        activeClientId={$activeClientId}
        onUpdate={(field, value) => updateAsset(asset.id, field, value)}
        onRemove={() => removeAsset(asset.id)}
      />
    {/each}
    
    <Card>
      <CardHeader><CardTitle class="text-base">Add Another Asset</CardTitle></CardHeader>
      <CardContent>
        <div class="grid md:grid-cols-3 gap-3">
          {#each assetCategories as cat}
            {@const CatIcon = cat.icon}
            <button onclick={() => addAsset(cat.value)} class="p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left flex items-center gap-3">
              <CatIcon class="h-5 w-5 text-primary shrink-0" />
              <div>
                <div class="font-medium text-sm">{cat.label}</div>
                <div class="text-xs text-muted-foreground">{cat.description}</div>
              </div>
            </button>
          {/each}
        </div>
      </CardContent>
    </Card>
  {/if}
</div>


