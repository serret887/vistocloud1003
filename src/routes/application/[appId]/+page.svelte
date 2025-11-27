<script lang="ts">
	import { currentStepId } from '$lib/stores/application';
	import ClientInfoStep from '$lib/components/steps/ClientInfoStep.svelte';
	import EmploymentStep from '$lib/components/steps/EmploymentStep.svelte';
	import IncomeStep from '$lib/components/steps/IncomeStep.svelte';
	import AssetsStep from '$lib/components/steps/AssetsStep.svelte';
	import RealEstateStep from '$lib/components/steps/RealEstateStep.svelte';
	import DocumentsStep from '$lib/components/steps/DocumentsStep.svelte';
	import DictateStep from '$lib/components/steps/DictateStep.svelte';
	import ReviewStep from '$lib/components/steps/ReviewStep.svelte';
</script>

{#if $currentStepId === 'client-info'}
	<ClientInfoStep />
{:else if $currentStepId === 'employment'}
	<EmploymentStep />
{:else if $currentStepId === 'income'}
	<IncomeStep />
{:else if $currentStepId === 'assets'}
	<AssetsStep />
{:else if $currentStepId === 'real-estate'}
	<RealEstateStep />
{:else if $currentStepId === 'documents'}
	<DocumentsStep />
{:else if $currentStepId === 'dictate'}
	<DictateStep />
{:else if $currentStepId === 'review'}
	<ReviewStep />
{:else}
	<ClientInfoStep />
{/if}

