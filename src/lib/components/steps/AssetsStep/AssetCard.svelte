<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Label, Checkbox } from '$lib/components/ui';
  import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '$lib/components/ui';
  import { MoneyInput } from '$lib/components/ui/validated-input';
  import { Trash2, Users } from 'lucide-svelte';
  import type { AssetRecord, AssetCategory } from '$lib/types/assets';
  import { _ } from 'svelte-i18n';
  
  interface Props {
    asset: AssetRecord;
    categoryInfo: { label: string; icon: any };
    accountTypes: { value: string; label: string }[];
    clientIds: string[];
    activeClientId: string;
    onUpdate: (field: string, value: string | number | string[]) => void;
    onRemove: () => void;
  }
  
  let { asset, categoryInfo, accountTypes, clientIds, activeClientId, onUpdate, onRemove }: Props = $props();
  const Icon = categoryInfo.icon;
</script>

<Card>
  <CardHeader class="flex flex-row items-start justify-between space-y-0">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon class="h-5 w-5 text-primary" />
      </div>
      <div>
        <CardTitle class="text-lg">{categoryInfo.label}</CardTitle>
        <CardDescription>
          {asset.institutionName || $_('assets.noInstitutionSpecified')}
          {#if asset.sharedClientIds?.length}
            <span class="text-primary"> • {$_('assets.jointAccount')}</span>
          {/if}
        </CardDescription>
      </div>
    </div>
    <Button variant="ghost" size="icon" onclick={onRemove}>
      <Trash2 class="h-4 w-4 text-destructive" />
    </Button>
  </CardHeader>
  <CardContent class="space-y-4">
    <div class="grid md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label class="after:content-['*'] after:ml-0.5 after:text-destructive">{$_('assets.institutionName')}</Label>
        <Input
          value={asset.institutionName || ''}
          oninput={(e) => onUpdate('institutionName', e.currentTarget.value)}
          placeholder={$_('assets.institutionNamePlaceholder')}
        />
      </div>
      <div class="space-y-2">
        <Label>{$_('assets.accountType')}</Label>
        <Select type="single" value={asset.type || undefined} onValueChange={(v) => v && onUpdate('type', v)}>
          <SelectTrigger class="w-full">
            <SelectValue placeholder={$_('common.select')} />
          </SelectTrigger>
          <SelectContent>
            {#each accountTypes as type}
              <SelectItem value={type.value}>{type.label}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <div class="grid md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label>{$_('assets.accountNumberLabel')}</Label>
        <Input
          value={asset.accountNumber || ''}
          oninput={(e) => onUpdate('accountNumber', e.currentTarget.value)}
          placeholder={$_('assets.accountNumberPlaceholder')}
          maxlength={4}
        />
      </div>
      <MoneyInput
        label={$_('assets.currentValue')}
        value={asset.amount || 0}
        onValueChange={(val) => onUpdate('amount', val)}
        required
      />
    </div>
    
    {#if asset.category === 'Gift'}
      <div class="space-y-2">
        <Label class="after:content-['*'] after:ml-0.5 after:text-destructive">{$_('assets.giftSource')}</Label>
        <Input
          value={asset.source || ''}
          oninput={(e) => onUpdate('source', e.currentTarget.value)}
          placeholder={$_('assets.giftSourcePlaceholder')}
        />
      </div>
    {/if}
    
    {#if clientIds.length > 1}
      <div class="p-4 rounded-lg border bg-muted/30">
        <div class="flex items-center gap-2 mb-3">
          <Users class="h-4 w-4 text-primary" />
          <Label>{$_('assets.jointAccountOwners')}</Label>
        </div>
        <div class="space-y-2">
          {#each clientIds.filter(id => id !== activeClientId) as clientId}
            <div class="flex items-center gap-2">
              <Checkbox
                checked={asset.sharedClientIds?.includes(clientId) || false}
                onCheckedChange={(checked) => {
                  const current = asset.sharedClientIds || [];
                  const updated = checked ? [...current, clientId] : current.filter(id => id !== clientId);
                  onUpdate('sharedClientIds', updated);
                }}
              />
              <Label class="text-sm">{clientId}</Label>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </CardContent>
</Card>



