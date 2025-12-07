<script lang="ts">
  import { Card, CardContent, Button } from '$lib/components/ui';
  import { Send, Loader2, AlertCircle } from 'lucide-svelte';
  import { applicationStore } from '$lib/stores/application';
  
  interface Props {
    isApplicationComplete: boolean;
    documentsComplete: boolean;
    isSubmitting: boolean;
    onSubmit: () => void;
  }
  
  let { isApplicationComplete, documentsComplete, isSubmitting, onSubmit }: Props = $props();
</script>

<Card>
  <CardContent class="pt-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 class="font-medium">Ready to Submit?</h3>
        <p class="text-sm text-muted-foreground">
          {#if isApplicationComplete}
            {#if documentsComplete}
              All required information and documents are complete. You can submit the application.
            {:else}
              All information complete, but some documents are missing. You can still submit.
            {/if}
          {:else}
            Some required information is missing. Please complete all sections before submitting.
          {/if}
        </p>
        {#if isApplicationComplete && !documentsComplete}
          <p class="text-xs text-warning mt-1 flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />Some documents are missing
          </p>
        {/if}
      </div>
      <div class="flex gap-3">
        <Button variant="outline" onclick={() => applicationStore.saveToFirebase()}>Save Draft</Button>
        <Button onclick={onSubmit} disabled={isSubmitting || !isApplicationComplete} class="gap-2">
          {#if isSubmitting}<Loader2 class="h-4 w-4 animate-spin" />Submitting...{:else}<Send class="h-4 w-4" />Submit Application{/if}
        </Button>
      </div>
    </div>
  </CardContent>
</Card>



