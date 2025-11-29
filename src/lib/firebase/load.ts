/**
 * Firebase load operations for application data
 */

import { db } from '$lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import type { ApplicationState } from '$lib/stores/application';
import { debug } from '$lib/debug';

/**
 * Load application data from Firestore
 */
export async function loadApplicationFromFirebase(
  applicationId: string
): Promise<ApplicationState | null> {
  try {
    debug.group(`Loading application ${applicationId} from Firestore`);
    console.log('📥 [FIREBASE] Loading application:', applicationId);
    
    // Load main application document
    const appRef = doc(db, 'applications', applicationId);
    const appSnap = await getDoc(appRef);
    
    if (!appSnap.exists()) {
      debug.warn(`Application ${applicationId} not found in Firestore`);
      console.warn('⚠️ [FIREBASE] Application not found:', applicationId);
      return null;
    }
    
    const appData = appSnap.data();
    console.log('📥 [FIREBASE] Main document loaded:', appData);
    
    // Load all client subcollections
    const clientIds = appData.clientIds || [];
    console.log('📥 [FIREBASE] Loading data for', clientIds.length, 'clients');
    
    const clientData: Record<string, any> = {};
    const addressData: Record<string, any> = {};
    const employmentData: Record<string, any> = {};
    const incomeData: Record<string, any> = {};
    const assetsData: Record<string, any> = {};
    const realEstateData: Record<string, any> = {};
    const documentsData: Record<string, any> = {};
    
    // Load data for each client
    for (const clientId of clientIds) {
      console.log('📥 [FIREBASE] Loading data for client:', clientId);
      
      // Load client data
      try {
        const clientRef = doc(db, 'applications', applicationId, 'clients', clientId);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
          clientData[clientId] = clientSnap.data();
        }
      } catch (error) {
        console.warn(`⚠️ [FIREBASE] Failed to load client data for ${clientId}:`, error);
      }
      
      // Load address data
      try {
        const addressRef = doc(db, 'applications', applicationId, 'addresses', clientId);
        const addressSnap = await getDoc(addressRef);
        if (addressSnap.exists()) {
          addressData[clientId] = addressSnap.data();
        }
      } catch (error) {
        console.warn(`⚠️ [FIREBASE] Failed to load address data for ${clientId}:`, error);
      }
      
      // Load employment data
      try {
        const employmentRef = doc(db, 'applications', applicationId, 'employment', clientId);
        const employmentSnap = await getDoc(employmentRef);
        if (employmentSnap.exists()) {
          employmentData[clientId] = employmentSnap.data();
        }
      } catch (error) {
        console.warn(`⚠️ [FIREBASE] Failed to load employment data for ${clientId}:`, error);
      }
      
      // Load income data
      try {
        const incomeRef = doc(db, 'applications', applicationId, 'income', clientId);
        const incomeSnap = await getDoc(incomeRef);
        if (incomeSnap.exists()) {
          incomeData[clientId] = incomeSnap.data();
        }
      } catch (error) {
        console.warn(`⚠️ [FIREBASE] Failed to load income data for ${clientId}:`, error);
      }
      
      // Load assets data
      try {
        const assetsRef = doc(db, 'applications', applicationId, 'assets', clientId);
        const assetsSnap = await getDoc(assetsRef);
        if (assetsSnap.exists()) {
          assetsData[clientId] = assetsSnap.data();
        }
      } catch (error) {
        console.warn(`⚠️ [FIREBASE] Failed to load assets data for ${clientId}:`, error);
      }
      
      // Load real estate data
      try {
        const realEstateRef = doc(db, 'applications', applicationId, 'realEstate', clientId);
        const realEstateSnap = await getDoc(realEstateRef);
        if (realEstateSnap.exists()) {
          realEstateData[clientId] = realEstateSnap.data();
        }
      } catch (error) {
        console.warn(`⚠️ [FIREBASE] Failed to load real estate data for ${clientId}:`, error);
      }
      
      // Load documents data
      try {
        const documentsRef = doc(db, 'applications', applicationId, 'documents', clientId);
        const documentsSnap = await getDoc(documentsRef);
        if (documentsSnap.exists()) {
          documentsData[clientId] = documentsSnap.data();
        }
      } catch (error) {
        console.warn(`⚠️ [FIREBASE] Failed to load documents data for ${clientId}:`, error);
      }
    }
    
    // Construct the application state
    const loadedState: ApplicationState = {
      currentApplicationId: applicationId,
      activeClientId: appData.activeClientId || appData.clientIds?.[0] || 'client-1',
      clientIds: appData.clientIds || [],
      currentStepId: appData.currentStepId || 'client-info',
      clientData: appData.clientData || clientData,
      addressData: appData.addressData || addressData,
      employmentData: appData.employmentData || employmentData,
      incomeData: appData.incomeData || incomeData,
      assetsData: appData.assetsData || assetsData,
      realEstateData: appData.realEstateData || realEstateData,
      documentsData: appData.documentsData || documentsData,
      isLoading: false,
      isSaving: false,
      lastSaved: appData.lastSaved || appData.updatedAt || null,
      validationErrors: appData.validationErrors || {} as Record<string, Record<string, any[]>>,
      visitedSteps: appData.visitedSteps && typeof appData.visitedSteps === 'object' && !Array.isArray(appData.visitedSteps) && !(appData.visitedSteps instanceof Set)
        ? Object.fromEntries(
            Object.entries(appData.visitedSteps).map(([clientId, steps]) => [
              clientId,
              Array.isArray(steps) ? new Set(steps) : steps instanceof Set ? steps : new Set()
            ])
          )
        : {} as Record<string, Set<string>>,
      touchedFields: appData.touchedFields && typeof appData.touchedFields === 'object' && !Array.isArray(appData.touchedFields) && !(appData.touchedFields instanceof Set)
        ? Object.fromEntries(
            Object.entries(appData.touchedFields).map(([clientId, fields]) => [
              clientId,
              Array.isArray(fields) ? new Set(fields) : fields instanceof Set ? fields : new Set()
            ])
          )
        : {} as Record<string, Set<string>>
    };
    
    // Merge subcollection data with main document data (subcollections take precedence)
    for (const clientId of clientIds) {
      if (clientData[clientId]) {
        loadedState.clientData[clientId] = clientData[clientId];
      }
      if (addressData[clientId]) {
        loadedState.addressData[clientId] = addressData[clientId];
      }
      if (employmentData[clientId]) {
        loadedState.employmentData[clientId] = employmentData[clientId];
      }
      if (incomeData[clientId]) {
        loadedState.incomeData[clientId] = incomeData[clientId];
      }
      if (assetsData[clientId]) {
        loadedState.assetsData[clientId] = assetsData[clientId];
      }
      if (realEstateData[clientId]) {
        loadedState.realEstateData[clientId] = realEstateData[clientId];
      }
      if (documentsData[clientId]) {
        loadedState.documentsData[clientId] = documentsData[clientId];
      }
    }
    
    console.log('✅ [FIREBASE] Application loaded successfully');
    console.log('✅ [FIREBASE] Loaded state:', {
      applicationId: loadedState.currentApplicationId,
      activeClientId: loadedState.activeClientId,
      clientIds: loadedState.clientIds,
      currentStepId: loadedState.currentStepId,
      hasClientData: Object.keys(loadedState.clientData).length > 0
    });
    
    debug.log('✅ Application loaded from Firestore');
    debug.groupEnd();
    
    return loadedState;
  } catch (error) {
    debug.firebase.error('loadApplication', error);
    console.error('❌ [FIREBASE] Failed to load application:', error);
    console.error('❌ [FIREBASE] Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      applicationId
    });
    debug.groupEnd();
    throw error;
  }
}

