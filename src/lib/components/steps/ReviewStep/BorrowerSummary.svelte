<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '$lib/components/ui';
  import { CheckCircle, AlertCircle } from 'lucide-svelte';
  import type { ApplicationState } from '$lib/stores/application/index';
  import { _ } from 'svelte-i18n';
  
  interface Props {
    clientIds: string[];
    store: ApplicationState;
  }
  
  let { clientIds, store }: Props = $props();
  
  function getClientData(clientId: string) { return store.clientData[clientId]; }
  function getEmploymentCount(clientId: string) { return store.employmentData[clientId]?.records?.length || 0; }
  function getAssetsCount(clientId: string) { return store.assetsData[clientId]?.records?.length || 0; }
  function getIncomeCount(clientId: string) {
    const income = store.incomeData[clientId];
    return (income?.activeIncomeRecords?.length || 0) + (income?.passiveIncomeRecords?.length || 0);
  }
  function getRealEstateCount(clientId: string) { return store.realEstateData[clientId]?.records?.length || 0; }
  
  function isClientComplete(clientId: string) {
    const client = getClientData(clientId);
    const address = store.addressData[clientId]?.present?.addr;
    return !!(client?.firstName && client?.lastName && client?.email && client?.phone && client?.ssn && client?.dob && client?.citizenship && client?.maritalStatus && address?.address1);
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>{$_('review.applicationSummary')}</CardTitle>
    <CardDescription>{$_('review.reviewBorrowerInfo')}</CardDescription>
  </CardHeader>
  <CardContent class="space-y-6">
    {#each clientIds as clientId, idx}
      {@const client = getClientData(clientId)}
      {@const isComplete = isClientComplete(clientId)}
      
      <div class="p-4 rounded-lg border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium">
            {client?.firstName || $_('review.client')} {client?.lastName || (idx + 1)}
            <span class="text-sm text-muted-foreground ml-2">({idx === 0 ? $_('clientInfo.primaryBorrower') : $_('clientInfo.coBorrower')})</span>
          </h3>
          <Badge variant={isComplete ? 'success' : 'warning'} class="gap-1">
            {#if isComplete}<CheckCircle class="h-3 w-3" />{$_('review.complete')}{:else}<AlertCircle class="h-3 w-3" />{$_('review.incomplete')}{/if}
          </Badge>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <div class="text-muted-foreground">{$_('review.personal')}</div>
            <div>{client?.firstName} {client?.lastName}</div>
            <div class="text-xs text-muted-foreground">{client?.citizenship || $_('review.noCitizenship')}</div>
          </div>
          <div>
            <div class="text-muted-foreground">{$_('review.contact')}</div>
            <div>{client?.email || $_('review.noEmail')}</div>
            <div>{client?.phone || $_('review.noPhone')}</div>
          </div>
          <div>
            <div class="text-muted-foreground">{$_('review.employment')}</div>
            <div>{getEmploymentCount(clientId)} {$_('review.employers')}</div>
            <div class="text-xs text-muted-foreground">{getIncomeCount(clientId)} {$_('review.incomeSources')}</div>
          </div>
          <div>
            <div class="text-muted-foreground">{$_('review.assetsAndProperty')}</div>
            <div>{getAssetsCount(clientId)} {$_('review.assetsCount')}</div>
            <div class="text-xs text-muted-foreground">{getRealEstateCount(clientId)} {$_('review.propertiesCount')}</div>
          </div>
        </div>
      </div>
    {/each}
  </CardContent>
</Card>



