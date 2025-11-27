<script lang="ts">
	import { page } from '$app/stores';
	import { getStepIdFromPath } from '$lib/applicationSteps';
	import ClientInfoStep from '$lib/components/steps/ClientInfoStep.svelte';
	import EmploymentStep from '$lib/components/steps/EmploymentStep.svelte';
	import IncomeStep from '$lib/components/steps/IncomeStep.svelte';
	import AssetsStep from '$lib/components/steps/AssetsStep.svelte';
	import RealEstateStep from '$lib/components/steps/RealEstateStep.svelte';
	import DocumentsStep from '$lib/components/steps/DocumentsStep.svelte';
	import DictateStep from '$lib/components/steps/DictateStep.svelte';
	import ReviewStep from '$lib/components/steps/ReviewStep.svelte';
	import { goto } from '$app/navigation';
	import { applicationStore, currentStepId } from '$lib/stores/application';
	
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

