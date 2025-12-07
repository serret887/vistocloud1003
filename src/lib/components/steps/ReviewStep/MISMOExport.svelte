<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '$lib/components/ui';
  import { FileText, Download, Loader2 } from 'lucide-svelte';
  
  interface Props {
    isExporting: boolean;
    onPreview: () => void;
    onExport: () => void;
  }
  
  let { isExporting, onPreview, onExport }: Props = $props();
</script>

<Card>
  <CardHeader>
    <div class="flex items-center gap-2">
      <FileText class="h-5 w-5 text-primary" />
      <div>
        <CardTitle>MISMO Export</CardTitle>
        <CardDescription>Generate MISMO 3.4 XML for loan registration</CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent class="space-y-4">
    <p class="text-sm text-muted-foreground">
      MISMO is the standard format for exchanging mortgage application data. Export to MISMO 3.4 XML for submission to lenders or LOS systems.
    </p>
    
    <div class="flex flex-wrap gap-3">
      <Button variant="outline" onclick={onPreview} class="gap-2">
        <FileText class="h-4 w-4" />Preview XML
      </Button>
      <Button variant="outline" onclick={onExport} disabled={isExporting} class="gap-2">
        {#if isExporting}<Loader2 class="h-4 w-4 animate-spin" />{:else}<Download class="h-4 w-4" />{/if}
        Export MISMO XML
      </Button>
    </div>
  </CardContent>
</Card>



