<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Label, Textarea } from '$lib/components/ui';
  import { StickyNote } from 'lucide-svelte';
  import { applicationStore } from '$lib/stores/application/index';
  import type { ApplicationState } from '$lib/stores/application/index';
  
  interface Props {
    clientIds: string[];
    store: ApplicationState;
  }
  
  let { clientIds, store }: Props = $props();
</script>

<Card>
  <CardHeader>
    <div class="flex items-center gap-2">
      <StickyNote class="h-5 w-5 text-primary" />
      <div>
        <CardTitle>Application Notes</CardTitle>
        <CardDescription>Add notes and comments for internal processing</CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent class="space-y-6">
    {#each clientIds as clientId}
      {@const client = store.clientData[clientId]}
      {@const employment = store.employmentData[clientId]}
      {@const income = store.incomeData[clientId]}
      <div class="space-y-4 border-b border-border pb-6 last:border-b-0 last:pb-0">
        <div class="font-medium text-base">{client?.firstName} {client?.lastName}</div>
        
        <div class="space-y-2">
          <Label>General Notes</Label>
          <Textarea
            placeholder="Add any notes about this client..."
            value={client?.generalNotes || ''}
            oninput={(e) => applicationStore.updateClientData(clientId, { generalNotes: e.currentTarget.value })}
            class="min-h-[100px]"
          />
        </div>

        <div class="space-y-2">
          <Label>Employment History Note</Label>
          <Textarea
            placeholder="Explain any gaps in employment history..."
            value={employment?.employmentNote || ''}
            oninput={(e) => {
              const current = store.employmentData[clientId];
              applicationStore.updateEmploymentRecord(clientId, current?.records?.[0]?.id ?? '', { employmentNote: e.currentTarget.value } as any);
            }}
            class="min-h-[100px]"
          />
        </div>

        {#if income?.activeIncomeRecords?.length || income?.passiveIncomeRecords?.length}
          <div class="space-y-3">
            <Label>Income Notes</Label>
            {#if income.activeIncomeRecords?.length}
              <div class="space-y-2">
                <div class="text-sm font-medium text-muted-foreground">Active Income</div>
                {#each income.activeIncomeRecords as rec}
                  <div class="space-y-1">
                    <div class="text-xs text-muted-foreground">{rec.companyName}</div>
                    <Textarea placeholder="Notes..." value={rec.notes || ''} oninput={(e) => applicationStore.updateActiveIncomeRecord(clientId, rec.id, { notes: e.currentTarget.value })} class="min-h-[60px] text-sm" />
                  </div>
                {/each}
              </div>
            {/if}
            {#if income.passiveIncomeRecords?.length}
              <div class="space-y-2">
                <div class="text-sm font-medium text-muted-foreground">Passive Income</div>
                {#each income.passiveIncomeRecords as rec}
                  <div class="space-y-1">
                    <div class="text-xs text-muted-foreground">{rec.sourceName}</div>
                    <Textarea placeholder="Notes..." value={rec.notes || ''} oninput={(e) => applicationStore.updatePassiveIncomeRecord(clientId, rec.id, { notes: e.currentTarget.value })} class="min-h-[60px] text-sm" />
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </CardContent>
</Card>


