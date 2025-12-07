<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui';
  
  interface Props {
    activeIncome: number;
    passiveIncome: number;
  }
  
  let { activeIncome, passiveIncome }: Props = $props();
  
  const totalIncome = $derived(activeIncome + passiveIncome);
  
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
</script>

<Card class="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
  <CardContent class="py-6">
    <div class="grid md:grid-cols-3 gap-6 text-center">
      <div>
        <p class="text-sm text-muted-foreground">Active Income</p>
        <p class="text-2xl font-bold text-primary">{formatCurrency(activeIncome)}</p>
        <p class="text-xs text-muted-foreground">per month</p>
      </div>
      <div>
        <p class="text-sm text-muted-foreground">Passive Income</p>
        <p class="text-2xl font-bold text-primary">{formatCurrency(passiveIncome)}</p>
        <p class="text-xs text-muted-foreground">per month</p>
      </div>
      <div>
        <p class="text-sm text-muted-foreground">Total Monthly</p>
        <p class="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
        <p class="text-xs text-muted-foreground">{formatCurrency(totalIncome * 12)}/year</p>
      </div>
    </div>
  </CardContent>
</Card>



