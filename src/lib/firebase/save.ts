/**
 * Firebase save operations for application data
 */
export { createApplicationInFirebase, saveApplicationToFirebase } from './save/application';
export { saveClientDataToFirebase } from './save/client';
export { 
  saveAddressDataToFirebase,
  saveEmploymentDataToFirebase,
  saveIncomeDataToFirebase,
  saveAssetsDataToFirebase,
  saveRealEstateDataToFirebase,
  saveLoanDataToFirebase
} from './save/data';
import { saveClientDataToFirebase } from './save/client';
import {
  saveAddressDataToFirebase,
  saveEmploymentDataToFirebase,
  saveIncomeDataToFirebase,
  saveAssetsDataToFirebase,
  saveRealEstateDataToFirebase,
  saveLoanDataToFirebase
} from './save/data';
import { debug } from '$lib/debug';

/**
 * Save all client data to Firestore (batch operation)
 */
export async function saveAllClientDataToFirebase(
  applicationId: string,
  clientId: string,
  data: {
    clientData?: any;
    addressData?: any;
    employmentData?: any;
    incomeData?: any;
    assetsData?: any;
    realEstateData?: any;
    loanData?: any;
  }
): Promise<void> {
  debug.group(`Saving all data for client ${clientId}`);
  
  const promises: Promise<void>[] = [];
  
  if (data.clientData) {
    promises.push(saveClientDataToFirebase(applicationId, clientId, data.clientData));
  }
  if (data.addressData) {
    promises.push(saveAddressDataToFirebase(applicationId, clientId, data.addressData));
  }
  if (data.employmentData) {
    promises.push(saveEmploymentDataToFirebase(applicationId, clientId, data.employmentData));
  }
  if (data.incomeData) {
    promises.push(saveIncomeDataToFirebase(applicationId, clientId, data.incomeData));
  }
  if (data.assetsData) {
    promises.push(saveAssetsDataToFirebase(applicationId, clientId, data.assetsData));
  }
  if (data.realEstateData) {
    promises.push(saveRealEstateDataToFirebase(applicationId, clientId, data.realEstateData));
  }
  if (data.loanData) {
    promises.push(saveLoanDataToFirebase(applicationId, clientId, data.loanData));
  }
  
  await Promise.all(promises);
  debug.groupEnd();
  debug.log('✅ All client data saved to Firebase');
}

