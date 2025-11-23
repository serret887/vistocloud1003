import { db } from '../../lib/firebase'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  Timestamp 
} from 'firebase/firestore'
import type { Application } from '../../types/application'
import type { ClientData } from '@/types/client-data'
import type { EmploymentRecord, ClientEmploymentData } from '@/types/employment'
import type { ActiveIncomeRecord, PassiveIncomeRecord, IncomeTotal } from '@/types/income'
import type { AssetRecord } from '@/types/assets'
import type { RealEstateOwned, ClientRealEstateData } from '@/types/real-estate'
import type { ClientAddressData } from '@/types/address'
import type { Condition } from '@/types/conditions'
import type { ChatMessage } from '@/types/voice-assistant'

// Keep existing function
export async function subscribeApplications(
  ownerId: string,
  onChange: (apps: Application[]) => void
) {
  const q = query(
    collection(db, 'applications'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  )
  const unsub = onSnapshot(q, (snap) => {
    const apps = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Application[]
    onChange(apps)
  })
  return unsub
}

// Helper to save client to Firestore
export async function saveClientToFirestore(
  applicationId: string,
  clientId: string,
  clientData: ClientData
): Promise<void> {
  const clientRef = doc(db, 'applications', applicationId, 'clients', clientId)
  await setDoc(clientRef, {
    ...clientData,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Helper to delete client from Firestore
export async function deleteClientFromFirestore(
  applicationId: string,
  clientId: string
): Promise<void> {
  const clientRef = doc(db, 'applications', applicationId, 'clients', clientId)
  await deleteDoc(clientRef)
}

// Helper to save employment record
export async function saveEmploymentToFirestore(
  applicationId: string,
  employmentId: string,
  employmentData: EmploymentRecord
): Promise<void> {
  const employmentRef = doc(db, 'applications', applicationId, 'employment', employmentId)
  await setDoc(employmentRef, {
    ...employmentData,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Helper to delete employment record
export async function deleteEmploymentFromFirestore(
  applicationId: string,
  employmentId: string
): Promise<void> {
  const employmentRef = doc(db, 'applications', applicationId, 'employment', employmentId)
  await deleteDoc(employmentRef)
}

// Helper to save active income
const activeIncomeCollectionPath = "incomeActive"
const passiveIncomeCollectionPath = "incomePassive"
const incomeTotalsCollectionPath = "incomeTotals"

const appDoc = (applicationId: string) => doc(db, "applications", applicationId)

export async function saveActiveIncomeToFirestore(
  applicationId: string,
  incomeId: string,
  incomeData: ActiveIncomeRecord
): Promise<void> {
  const incomeRef = doc(db, 'applications', applicationId, activeIncomeCollectionPath, incomeId)
  await setDoc(incomeRef, {
    ...incomeData,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Helper to delete active income
export async function deleteActiveIncomeFromFirestore(
  applicationId: string,
  incomeId: string
): Promise<void> {
  const incomeRef = doc(db, 'applications', applicationId, activeIncomeCollectionPath, incomeId)
  await deleteDoc(incomeRef)
}

// Helper to save passive income
export async function savePassiveIncomeToFirestore(
  applicationId: string,
  incomeId: string,
  incomeData: PassiveIncomeRecord
): Promise<void> {
  const incomeRef = doc(db, 'applications', applicationId, passiveIncomeCollectionPath, incomeId)
  await setDoc(incomeRef, {
    ...incomeData,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Helper to delete passive income
export async function deletePassiveIncomeFromFirestore(
  applicationId: string,
  incomeId: string
): Promise<void> {
  const incomeRef = doc(db, 'applications', applicationId, passiveIncomeCollectionPath, incomeId)
  await deleteDoc(incomeRef)
}

// Helper to save income total
export async function saveIncomeTotalToFirestore(
  applicationId: string,
  clientId: string,
  totalData: IncomeTotal
): Promise<void> {
  const totalRef = doc(db, 'applications', applicationId, incomeTotalsCollectionPath, clientId)
  await setDoc(totalRef, {
    ...totalData,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Helper to save asset
export async function saveAssetToFirestore(
  applicationId: string,
  assetId: string,
  assetData: AssetRecord
): Promise<void> {
  const assetRef = doc(db, 'applications', applicationId, 'assets', assetId)
  await setDoc(assetRef, {
    ...assetData,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Helper to delete asset
export async function deleteAssetFromFirestore(
  applicationId: string,
  assetId: string
): Promise<void> {
  const assetRef = doc(db, 'applications', applicationId, 'assets', assetId)
  await deleteDoc(assetRef)
}

// Helper to save real estate
export async function saveRealEstateToFirestore(
  applicationId: string,
  propertyId: string,
  propertyData: RealEstateOwned
): Promise<void> {
  const propertyRef = doc(db, 'applications', applicationId, 'realEstate', propertyId)
  await setDoc(propertyRef, {
    ...propertyData,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Helper to delete real estate
export async function deleteRealEstateFromFirestore(
  applicationId: string,
  propertyId: string
): Promise<void> {
  const propertyRef = doc(db, 'applications', applicationId, 'realEstate', propertyId)
  await deleteDoc(propertyRef)
}

// Helper to save address
export async function saveAddressToFirestore(
  applicationId: string,
  clientId: string,
  addressData: ClientAddressData
): Promise<void> {
  const addressRef = doc(db, 'applications', applicationId, 'addresses', clientId)
  await setDoc(addressRef, {
    ...addressData,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Helper to save condition
export async function saveConditionToFirestore(
  applicationId: string,
  conditionId: string,
  conditionData: Condition
): Promise<void> {
  const conditionRef = doc(db, 'applications', applicationId, 'conditions', conditionId)
  await setDoc(conditionRef, {
    ...conditionData,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Helper to save chat message (chatHistory collection with application ID)
export async function saveChatMessageToFirestore(
  applicationId: string,
  messageId: string,
  messageData: ChatMessage
): Promise<void> {
  const messageRef = doc(db, 'applications', applicationId, 'chatHistory', messageId)
  // Convert Date to Timestamp for Firestore
  const timestamp = messageData.timestamp instanceof Date 
    ? Timestamp.fromDate(messageData.timestamp)
    : serverTimestamp()
  
  await setDoc(messageRef, {
    ...messageData,
    timestamp,
    applicationId, // Store application ID in the message document
  }, { merge: true })
}

// Load all application data from Firestore
export async function loadApplicationDataFromFirestore(
  applicationId: string
): Promise<{
  clients: { [id: string]: ClientData };
  employmentData: { [clientId: string]: ClientEmploymentData };
  activeIncomeData: { [clientId: string]: ActiveIncomeRecord[] };
  passiveIncomeData: { [clientId: string]: PassiveIncomeRecord[] };
  incomeTotals: { [clientId: string]: IncomeTotal };
  assetsData: { [clientId: string]: AssetRecord[] };
  realEstateData: { [clientId: string]: ClientRealEstateData };
  addressData: { [clientId: string]: ClientAddressData };
  conditionsData: { [clientId: string]: Condition[] };
  chatHistory: ChatMessage[];
}> {
  // Load all subcollections in parallel
  const applicationRef = appDoc(applicationId)

  const [clientsSnap, employmentSnap, activeIncomeSnap, passiveIncomeSnap, incomeTotalsSnap, 
         assetsSnap, realEstateSnap, addressesSnap, conditionsSnap, chatHistorySnap] = await Promise.all([
    getDocs(collection(applicationRef, 'clients')),
    getDocs(collection(applicationRef, 'employment')),
    getDocs(collection(applicationRef, activeIncomeCollectionPath)),
    getDocs(collection(applicationRef, passiveIncomeCollectionPath)),
    getDocs(collection(applicationRef, incomeTotalsCollectionPath)),
    getDocs(collection(applicationRef, 'assets')),
    getDocs(collection(applicationRef, 'realEstate')),
    getDocs(collection(applicationRef, 'addresses')),
    getDocs(collection(applicationRef, 'conditions')),
    getDocs(collection(applicationRef, 'chatHistory')),
  ])
  
  // Transform clients
  const clients: { [id: string]: ClientData } = {}
  clientsSnap.docs.forEach(doc => {
    clients[doc.id] = doc.data() as ClientData
  })
  
  // Transform employment data by clientId
  const employmentData: { [clientId: string]: ClientEmploymentData } = {}
  employmentSnap.docs.forEach(doc => {
    const record = doc.data() as EmploymentRecord
    if (!employmentData[record.clientId]) {
      employmentData[record.clientId] = {
        clientId: record.clientId,
        records: []
      }
    }
    employmentData[record.clientId].records.push(record)
  })
  
  // Transform active income by clientId
  const activeIncomeData: { [clientId: string]: ActiveIncomeRecord[] } = {}
  activeIncomeSnap.docs.forEach(doc => {
    const record = doc.data() as ActiveIncomeRecord
    if (!activeIncomeData[record.clientId]) {
      activeIncomeData[record.clientId] = []
    }
    activeIncomeData[record.clientId].push(record)
  })
  
  // Transform passive income by clientId
  const passiveIncomeData: { [clientId: string]: PassiveIncomeRecord[] } = {}
  passiveIncomeSnap.docs.forEach(doc => {
    const record = doc.data() as PassiveIncomeRecord
    if (!passiveIncomeData[record.clientId]) {
      passiveIncomeData[record.clientId] = []
    }
    passiveIncomeData[record.clientId].push(record)
  })
  
  // Transform income totals by clientId
  const incomeTotals: { [clientId: string]: IncomeTotal } = {}
  incomeTotalsSnap.docs.forEach(doc => {
    const total = doc.data() as IncomeTotal
    incomeTotals[total.clientId] = total
  })
  
  // Transform assets by clientId
  const assetsData: { [clientId: string]: AssetRecord[] } = {}
  assetsSnap.docs.forEach(doc => {
    const asset = doc.data() as AssetRecord
    if (!assetsData[asset.clientId]) {
      assetsData[asset.clientId] = []
    }
    assetsData[asset.clientId].push(asset)
  })
  
  // Transform real estate by clientId
  const realEstateData: { [clientId: string]: ClientRealEstateData } = {}
  realEstateSnap.docs.forEach(doc => {
    const property = doc.data() as RealEstateOwned
    if (!realEstateData[property.clientId]) {
      realEstateData[property.clientId] = {
        clientId: property.clientId,
        records: []
      }
    }
    realEstateData[property.clientId].records.push(property)
  })
  
  // Transform addresses by clientId
  const addressData: { [clientId: string]: ClientAddressData } = {}
  addressesSnap.docs.forEach(doc => {
    const addr = doc.data() as ClientAddressData
    // Extract clientId from document ID or from the data
    const clientId = doc.id
    addressData[clientId] = addr
  })
  
  // Transform conditions by clientId
  const conditionsData: { [clientId: string]: Condition[] } = {}
  conditionsSnap.docs.forEach(doc => {
    const condition = doc.data() as Condition
    if (!conditionsData[condition.clientId]) {
      conditionsData[condition.clientId] = []
    }
    conditionsData[condition.clientId].push(condition)
  })
  
  // Transform chat history
  const chatHistory: ChatMessage[] = chatHistorySnap.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
    } as ChatMessage
  }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  
  return {
    clients,
    employmentData,
    activeIncomeData,
    passiveIncomeData,
    incomeTotals,
    assetsData,
    realEstateData,
    addressData,
    conditionsData,
    chatHistory,
  }
}




