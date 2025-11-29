<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '$lib/components/ui';
  import { CheckCircle, AlertCircle } from 'lucide-svelte';
  import type { ApplicationState } from '$lib/stores/application';
  
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
    <CardTitle>Application Summary</CardTitle>
    <CardDescription>Review all borrower information before submission</CardDescription>
  </CardHeader>
  <CardContent class="space-y-6">
    {#each clientIds as clientId, idx}
      {@const client = getClientData(clientId)}
      {@const isComplete = isClientComplete(clientId)}
      
      <div class="p-4 rounded-lg border">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium">
            {client?.firstName || 'Client'} {client?.lastName || (idx + 1)}
            <span class="text-sm text-muted-foreground ml-2">{idx === 0 ? '(Primary Borrower)' : '(Co-Borrower)'}</span>
          </h3>
          <Badge variant={isComplete ? 'success' : 'warning'} class="gap-1">
            {#if isComplete}<CheckCircle class="h-3 w-3" />Complete{:else}<AlertCircle class="h-3 w-3" />Incomplete{/if}
          </Badge>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <div class="text-muted-foreground">Personal</div>
            <div>{client?.firstName} {client?.lastName}</div>
            <div class="text-xs text-muted-foreground">{client?.citizenship || 'No citizenship'}</div>
          </div>
          <div>
            <div class="text-muted-foreground">Contact</div>
            <div>{client?.email || 'No email'}</div>
            <div>{client?.phone || 'No phone'}</div>
          </div>
          <div>
            <div class="text-muted-foreground">Employment</div>
            <div>{getEmploymentCount(clientId)} employer(s)</div>
            <div class="text-xs text-muted-foreground">{getIncomeCount(clientId)} income source(s)</div>
          </div>
          <div>
            <div class="text-muted-foreground">Assets & Property</div>
            <div>{getAssetsCount(clientId)} asset(s)</div>
            <div class="text-xs text-muted-foreground">{getRealEstateCount(clientId)} property(s)</div>
          </div>
        </div>
      </div>
    {/each}
  </CardContent>
</Card>


