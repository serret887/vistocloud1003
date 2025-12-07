<script lang="ts">
  import { applicationStore, clientIds } from '$lib/stores/application/index';
  import { Card, CardHeader, CardTitle, CardContent, Button } from '$lib/components/ui';
  import { AlertCircle, CheckCircle } from 'lucide-svelte';
  import ClientTabs from '../ClientTabs.svelte';
  import BorrowerSummary from './BorrowerSummary.svelte';
  import NotesSection from './NotesSection.svelte';
  import MISMOExport from './MISMOExport.svelte';
  import SubmitSection from './SubmitSection.svelte';
  import { get } from 'svelte/store';
  import { downloadMISMO, validateMISMO, generateMISMO } from '$lib/mismo';
  import { isStepComplete } from '$lib/validation/index';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  let store = $derived(get(applicationStore));
  let isSubmitting = $state(false);
  let isExporting = $state(false);
  let validationErrors = $state<string[]>([]);
  let submitSuccess = $state(false);
  let showDocumentWarning = $state(false);
  
  const documentsComplete = $derived($clientIds.every(clientId => isStepComplete('documents', store)));
  
  function isClientComplete(clientId: string) {
    const client = store.clientData[clientId];
    const address = store.addressData[clientId]?.present?.addr;
    return !!(client?.firstName && client?.lastName && client?.email && client?.phone && client?.ssn && client?.dob && client?.citizenship && client?.maritalStatus && address?.address1);
  }
  
  function isApplicationComplete() { return $clientIds.every(id => isClientComplete(id)); }
  
  async function handleExportMISMO() {
    isExporting = true;
    validationErrors = [];
    try {
      const state = get(applicationStore);
      const validation = validateMISMO(state);
      if (!validation.valid) { validationErrors = validation.errors; isExporting = false; return; }
      downloadMISMO(state, `mismo-${state.currentApplicationId || 'application'}.xml`);
    } catch (error) { validationErrors = ['Failed to generate MISMO XML']; }
    finally { isExporting = false; }
  }
  
  async function handleSubmit(confirmed = false) {
    if (!documentsComplete && !confirmed) { showDocumentWarning = true; return; }
    showDocumentWarning = false;
    isSubmitting = true;
    validationErrors = [];
    submitSuccess = false;
    
    try {
      const state = get(applicationStore);
      const validation = validateMISMO(state);
      if (!validation.valid) { validationErrors = validation.errors; isSubmitting = false; return; }
      generateMISMO(state);
      await applicationStore.saveToFirebase();
      submitSuccess = true;
      downloadMISMO(state, `submitted-${state.currentApplicationId || 'application'}.xml`);
    } catch (error) { validationErrors = ['Failed to submit application. Please try again.']; }
    finally { isSubmitting = false; }
  }
  
  function previewMISMO() {
    const state = get(applicationStore);
    const xml = generateMISMO(state);
    const win = window.open('', '_blank');
    if (win) { win.document.write(`<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px;">${xml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`); win.document.title = 'MISMO XML Preview'; }
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <ClientTabs />
  
  <BorrowerSummary clientIds={$clientIds} {store} />
  
  {#if showDocumentWarning}
    <Card class="border-warning bg-warning/5">
      <CardHeader><CardTitle class="text-warning flex items-center gap-2"><AlertCircle class="h-5 w-5" />Incomplete Documentation</CardTitle></CardHeader>
      <CardContent class="space-y-4">
        <p class="text-sm text-muted-foreground">Some documents haven't been uploaded. You can still submit, but may need to provide them later.</p>
        <div class="flex gap-3">
          <Button variant="outline" onclick={async () => { showDocumentWarning = false; const appId = $page.params.appId; if (appId) await goto(`/application/${appId}/documents`); }}>Go to Documentation</Button>
          <Button variant="default" onclick={() => handleSubmit(true)}>Submit Anyway</Button>
        </div>
      </CardContent>
    </Card>
  {/if}
  
  {#if validationErrors.length > 0}
    <Card class="border-destructive">
      <CardHeader><CardTitle class="text-destructive flex items-center gap-2"><AlertCircle class="h-5 w-5" />Validation Errors</CardTitle></CardHeader>
      <CardContent>
        <ul class="space-y-1 text-sm text-destructive">
          {#each validationErrors as error}<li class="flex items-start gap-2"><AlertCircle class="h-4 w-4 mt-0.5 shrink-0" />{error}</li>{/each}
        </ul>
      </CardContent>
    </Card>
  {/if}
  
  {#if submitSuccess}
    <Card class="border-success bg-success/5">
      <CardContent class="pt-6">
        <div class="flex items-center gap-3 text-success">
          <CheckCircle class="h-6 w-6" />
          <div><div class="font-medium">Application Submitted Successfully</div><div class="text-sm opacity-80">MISMO XML has been downloaded for your records</div></div>
        </div>
      </CardContent>
    </Card>
  {/if}
  
  <NotesSection clientIds={$clientIds} {store} />
  <MISMOExport {isExporting} onPreview={previewMISMO} onExport={handleExportMISMO} />
  <SubmitSection isApplicationComplete={isApplicationComplete()} {documentsComplete} {isSubmitting} onSubmit={() => handleSubmit(false)} />
</div>


