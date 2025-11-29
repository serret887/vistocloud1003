// Derived stores for the application
import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { ApplicationState, ValidationError } from './types';
import type { ClientData } from '$lib/types/client-data';
import type { ClientEmploymentData } from '$lib/types/employment';
import type { ClientIncomeData } from '$lib/types/income';
import type { ClientAssetsData } from '$lib/types/assets';
import type { ClientRealEstateData } from '$lib/types/real-estate';
import type { ClientAddressData } from '$lib/types/address';
import type { ApplicationStepId } from '$lib/types/application';

export function createDerivedStores(store: Readable<ApplicationState>) {
  const activeClientId = derived(store, $state => $state.activeClientId);
  const currentStepId = derived(store, $state => $state.currentStepId);
  const clientIds = derived(store, $state => $state.clientIds);
  
  const activeClientData = derived(store, $state => 
    $state.clientData[$state.activeClientId]
  );
  
  const activeEmploymentData = derived(store, $state =>
    $state.employmentData[$state.activeClientId]
  );
  
  const activeAssetsData = derived(store, $state =>
    $state.assetsData[$state.activeClientId]
  );
  
  const activeRealEstateData = derived(store, $state =>
    $state.realEstateData[$state.activeClientId]
  );
  
  const activeAddressData = derived(store, $state =>
    $state.addressData[$state.activeClientId]
  );
  
  const activeIncomeData = derived(store, $state =>
    $state.incomeData[$state.activeClientId]
  );
  
  // Validation errors for current step - per client
  // Only show errors when REVISITING a step (not on first visit)
  const currentStepValidationErrors = derived(
    [store, currentStepId, activeClientId],
    ([$store, $stepId, $clientId]) => {
      if (!$clientId) return [];
      
      // Don't validate dictate or review steps
      if ($stepId === 'dictate' || $stepId === 'review') return [];
      
      const clientVisitedSteps = $store.visitedSteps[$clientId];
      const clientValidationErrors = $store.validationErrors[$clientId];
      
      // Only show validation errors if this step was PREVIOUSLY visited (revisiting)
      // First visit = no errors shown in the big box
      const hasBeenVisited = clientVisitedSteps instanceof Set && clientVisitedSteps.has($stepId);
      
      if (hasBeenVisited) {
        // Revisiting a step - show all validation errors
        return clientValidationErrors?.[$stepId] || [];
      }
      
      // First visit - no errors shown
      return [];
    }
  );
  
  return {
    activeClientId,
    currentStepId,
    clientIds,
    activeClientData,
    activeEmploymentData,
    activeAssetsData,
    activeRealEstateData,
    activeAddressData,
    activeIncomeData,
    currentStepValidationErrors
  };
}


