<script lang="ts">
  import { page } from '$app/stores';
  import { getStepIdFromPath } from '$lib/applicationSteps';
  import ClientInfoStep from '$lib/components/steps/ClientInfoStep/index.svelte';
  import EmploymentStep from '$lib/components/steps/EmploymentStep/index.svelte';
  import IncomeStep from '$lib/components/steps/IncomeStep/index.svelte';
  import AssetsStep from '$lib/components/steps/AssetsStep/index.svelte';
  import RealEstateStep from '$lib/components/steps/RealEstateStep/index.svelte';
  import LoanInfoStep from '$lib/components/steps/LoanInfoStep/index.svelte';
  import DocumentsStep from '$lib/components/steps/DocumentsStep/index.svelte';
  import DictateStep from '$lib/components/steps/DictateStep/index.svelte';
  import ReviewStep from '$lib/components/steps/ReviewStep/index.svelte';
  import { goto } from '$app/navigation';
  import { applicationStore, currentStepId } from '$lib/stores/application/index';
  
  // Get step from URL
  const stepId = $derived(getStepIdFromPath($page.url.pathname));
  
  // Sync store with URL step
  $effect(() => {
    if (stepId && stepId !== $currentStepId) {
      applicationStore.setCurrentStep(stepId);
    }
  });
</script>

{#if stepId === 'client-info'}
  <ClientInfoStep />
{:else if stepId === 'employment'}
  <EmploymentStep />
{:else if stepId === 'income'}
  <IncomeStep />
{:else if stepId === 'assets'}
  <AssetsStep />
{:else if stepId === 'real-estate'}
  <RealEstateStep />
{:else if stepId === 'loan-info'}
  <LoanInfoStep />
{:else if stepId === 'documents'}
  <DocumentsStep />
{:else if stepId === 'dictate'}
  <DictateStep />
{:else if stepId === 'review'}
  <ReviewStep />
{:else}
  <!-- Default to client-info if invalid step - redirect immediately -->
  {@const appId = $page.params.appId}
  {#if appId}
    {@const defaultPath = `/application/${appId}/client-info`}
    {#await goto(defaultPath) then _}
      <!-- Redirecting... -->
    {/await}
  {:else}
    <ClientInfoStep />
  {/if}
{/if}
