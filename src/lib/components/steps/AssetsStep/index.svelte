<script lang="ts">
  import { applicationStore, activeClientId, activeAssetsData, clientIds } from '$lib/stores/application/index';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
  import { EmptyState } from '$lib/components/shared';
  import ClientTabs from '../ClientTabs.svelte';
  import AssetCard from './AssetCard.svelte';
  import { Wallet, Building, TrendingUp, PiggyBank, Gift } from 'lucide-svelte';
  import type { AssetCategory } from '$lib/types/assets';
  import { _, locale } from 'svelte-i18n';
  import { get } from 'svelte/store';
  
  const assetCategories = $derived.by(() => {
    const t = get(_);
    return [
      { value: 'BankAccount' as AssetCategory, label: t('assets.categories.bankAccount'), icon: Building, description: t('assets.categories.bankAccountDescription') },
      { value: 'StocksAndBonds' as AssetCategory, label: t('assets.categories.stocksAndBonds'), icon: TrendingUp, description: t('assets.categories.stocksAndBondsDescription') },
      { value: 'LifeInsurance' as AssetCategory, label: t('assets.categories.lifeInsurance'), icon: Wallet, description: t('assets.categories.lifeInsuranceDescription') },
      { value: 'RetirementFund' as AssetCategory, label: t('assets.categories.retirementFund'), icon: PiggyBank, description: t('assets.categories.retirementFundDescription') },
      { value: 'Gift' as AssetCategory, label: t('assets.categories.gift'), icon: Gift, description: t('assets.categories.giftDescription') },
      { value: 'Other' as AssetCategory, label: t('assets.categories.other'), icon: Wallet, description: t('assets.categories.otherDescription') }
    ];
  });
  
  const accountTypes = $derived.by(() => {
    const t = get(_);
    return {
      'BankAccount': [{ value: 'Checking', label: t('assets.types.checking') }, { value: 'Savings', label: t('assets.types.savings') }, { value: 'Money Market', label: t('assets.types.moneyMarket') }, { value: 'CD', label: t('assets.types.cd') }],
      'StocksAndBonds': [{ value: 'Stocks', label: t('assets.types.stocks') }, { value: 'Bonds', label: t('assets.types.bonds') }, { value: 'Mutual Funds', label: t('assets.types.mutualFunds') }, { value: 'ETFs', label: t('assets.types.etfs') }],
      'LifeInsurance': [{ value: 'Whole Life', label: t('assets.types.wholeLife') }, { value: 'Universal Life', label: t('assets.types.universalLife') }],
      'RetirementFund': [{ value: '401k', label: t('assets.types.401k') }, { value: 'IRA', label: t('assets.types.ira') }, { value: 'Roth IRA', label: t('assets.types.rothIra') }, { value: 'Pension', label: t('assets.types.pension') }],
      'Gift': [{ value: 'Family Gift', label: t('assets.types.familyGift') }, { value: 'Employer Gift', label: t('assets.types.employerGift') }],
      'Other': [{ value: 'Other', label: t('assets.types.other') }]
    } as Record<AssetCategory, { value: string; label: string }[]>;
  });
  
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
      <p class="text-sm text-muted-foreground">{$_('assets.totalAssets')}</p>
      <p class="text-3xl font-bold text-success">{formatCurrency(totalAssets)}</p>
    </CardContent>
  </Card>
  
  {#if !hasRecords}
    <Card class="border-dashed">
      <CardContent class="py-12">
        <div class="text-center space-y-4">
          <EmptyState icon="💰" title={$_('assets.noAssetsAdded')} description={$_('assets.addAssetsDescription')} />
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
      <CardHeader><CardTitle class="text-base">{$_('assets.addAnotherAsset')}</CardTitle></CardHeader>
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


