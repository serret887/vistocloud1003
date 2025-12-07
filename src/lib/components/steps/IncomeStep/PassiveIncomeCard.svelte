<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Label } from '$lib/components/ui';
  import { ValidatedSelect, MoneyInput } from '$lib/components/ui/validated-input';
  import { Plus, Trash2, TrendingUp } from 'lucide-svelte';
  import { PASSIVE_INCOME_TYPE_LABELS, type PassiveIncomeType, type PassiveIncomeRecord } from '$lib/types/income';
  
  interface Props {
    records: PassiveIncomeRecord[];
    onAdd: () => void;
    onUpdate: (recordId: string, updates: Partial<PassiveIncomeRecord>) => void;
    onRemove?: (recordId: string) => void;
  }
  
  let { records, onAdd, onUpdate, onRemove }: Props = $props();
  
  const passiveIncomeTypes = Object.entries(PASSIVE_INCOME_TYPE_LABELS).map(([value, label]) => ({
    value: value as PassiveIncomeType,
    label
  }));
</script>

<Card>
  <CardHeader class="flex flex-row items-center justify-between space-y-0">
    <div class="flex items-center gap-2">
      <TrendingUp class="h-5 w-5 text-primary" />
      <div>
        <CardTitle>Other Income Sources</CardTitle>
        <CardDescription>Non-employment income (Social Security, pension, etc.)</CardDescription>
      </div>
    </div>
    <Button variant="outline" size="sm" onclick={onAdd} class="gap-2">
      <Plus class="h-4 w-4" />
      Add Income Source
    </Button>
  </CardHeader>
  <CardContent>
    {#if records.length === 0}
      <div class="text-center py-8 text-muted-foreground">
        <p>No other income sources added.</p>
        <p class="text-sm mt-1">Add if you receive income from Social Security, pension, investments, etc.</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each records as income, idx}
          <div class="p-4 rounded-lg border space-y-4">
            <div class="flex items-center justify-between">
              <span class="font-medium">Income Source {idx + 1}</span>
              {#if onRemove}
                <Button variant="ghost" size="icon" onclick={() => onRemove(income.id)}>
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              {/if}
            </div>
            
            <div class="grid md:grid-cols-3 gap-4">
              <ValidatedSelect
                label="Source Type"
                value={income.sourceType || undefined}
                onValueChange={(value) => value && onUpdate(income.id, { sourceType: value as PassiveIncomeType })}
                options={passiveIncomeTypes}
                placeholder="Select type..."
                required
                showError={true}
              />
              <div class="space-y-2">
                <Label>Source Name</Label>
                <Input 
                  value={income.sourceName} 
                  oninput={(e) => onUpdate(income.id, { sourceName: e.currentTarget.value })}
                  placeholder="e.g., SSA, Company Pension" 
                />
              </div>
              <MoneyInput
                label="Monthly Amount"
                value={income.monthlyAmount || 0}
                onValueChange={(val) => onUpdate(income.id, { monthlyAmount: val })}
                required
              />
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </CardContent>
</Card>



