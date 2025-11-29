<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '$lib/components/ui';
  import { MoneyInput } from '$lib/components/ui/validated-input';
  import { Briefcase } from 'lucide-svelte';
  import type { EmploymentRecord } from '$lib/types/employment';
  import type { ActiveIncomeRecord } from '$lib/types/income';
  
  interface Props {
    employmentRecords: EmploymentRecord[];
    incomeRecords: ActiveIncomeRecord[];
    onUpdateIncome: (empId: string, field: string, value: number | string) => void;
    hasFieldError: (field: string) => boolean;
    getFieldError: (field: string) => string | null;
  }
  
  let { employmentRecords, incomeRecords, onUpdateIncome, hasFieldError, getFieldError }: Props = $props();
  
  function getIncomeRecord(empId: string): ActiveIncomeRecord | undefined {
    return incomeRecords.find(r => r.employmentRecordId === empId);
  }
</script>

<Card>
  <CardHeader>
    <div class="flex items-center gap-2">
      <Briefcase class="h-5 w-5 text-primary" />
      <div>
        <CardTitle>Employment Income</CardTitle>
        <CardDescription>Income from current employers</CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    {#if employmentRecords.length === 0}
      <div class="text-center py-8">
        <p class="text-muted-foreground">
          No current employment records found. Mark at least one employer as "Currently Employed Here" in the Employment step.
        </p>
        <Button variant="link" class="mt-2">Go to Employment →</Button>
      </div>
    {:else}
      <div class="space-y-6">
        {#each employmentRecords as emp, idx}
          {@const incomeRecord = getIncomeRecord(emp.id)}
          <div class="p-4 rounded-lg border space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium">{emp.employerName || 'Employer'}</div>
                <div class="text-sm text-muted-foreground">
                  {emp.jobTitle || 'Position'} 
                  {#if emp.currentlyEmployed}
                    <span class="text-success">• Current</span>
                  {/if}
                </div>
              </div>
              {#if emp.selfEmployed}
                <span class="text-xs bg-warning/10 text-warning px-2 py-1 rounded">Self-Employed</span>
              {/if}
            </div>
            
            <div class="grid md:grid-cols-4 gap-4">
              <MoneyInput
                label="Base Monthly"
                value={incomeRecord?.monthlyAmount || 0}
                onValueChange={(val) => onUpdateIncome(emp.id, 'monthlyAmount', val)}
                required
                error={hasFieldError(`activeIncome.${idx}.monthlyAmount`) ? getFieldError(`activeIncome.${idx}.monthlyAmount`) || undefined : undefined}
                showError={true}
              />
              <MoneyInput
                label="Overtime"
                value={incomeRecord?.overtime || 0}
                onValueChange={(val) => onUpdateIncome(emp.id, 'overtime', val)}
              />
              <MoneyInput
                label="Bonus"
                value={incomeRecord?.bonus || 0}
                onValueChange={(val) => onUpdateIncome(emp.id, 'bonus', val)}
              />
              <MoneyInput
                label="Commissions"
                value={incomeRecord?.commissions || 0}
                onValueChange={(val) => onUpdateIncome(emp.id, 'commissions', val)}
              />
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </CardContent>
</Card>


