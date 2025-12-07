// Address-related store actions
import type { Writable } from 'svelte/store';
import type { ApplicationState } from '../types';
import type { AddressRecord } from '$lib/types/address';
import { generateId } from '$lib/idGenerator';
import { createEmptyAddress, createDefaultAddressData } from '../defaults';

export function createAddressActions(
  update: Writable<ApplicationState>['update']
) {
  return {
    updatePresentAddress: (clientId: string, address: Partial<AddressRecord>) => {
      update(state => ({
        ...state,
        addressData: {
          ...state.addressData,
          [clientId]: {
            ...state.addressData[clientId],
            present: { ...state.addressData[clientId].present, ...address }
          }
        }
      }));
    },
    
    updateMailingAddress: (clientId: string, address: Partial<AddressRecord>) => {
      update(state => {
        const currentAddressData = state.addressData[clientId] || createDefaultAddressData(clientId);
        const currentMailing = currentAddressData.mailing || {
          id: generateId('addr'),
          fromDate: '',
          toDate: '',
          addr: createEmptyAddress(),
          isPresent: false
        };
        
        return {
          ...state,
          addressData: {
            ...state.addressData,
            [clientId]: {
              ...currentAddressData,
              mailing: { ...currentMailing, ...address }
            }
          }
        };
      });
    },
    
    addFormerAddress: (clientId: string) => {
      const newAddress: AddressRecord = {
        id: generateId('addr'),
        fromDate: '',
        toDate: '',
        addr: createEmptyAddress(),
        isPresent: false
      };
      
      update(state => ({
        ...state,
        addressData: {
          ...state.addressData,
          [clientId]: {
            ...state.addressData[clientId],
            former: [...state.addressData[clientId].former, newAddress]
          }
        }
      }));
      
      return newAddress.id;
    },
    
    updateFormerAddress: (clientId: string, addressId: string, updates: Partial<AddressRecord>) => {
      update(state => ({
        ...state,
        addressData: {
          ...state.addressData,
          [clientId]: {
            ...state.addressData[clientId],
            former: state.addressData[clientId].former.map(addr =>
              addr.id === addressId ? { ...addr, ...updates } : addr
            )
          }
        }
      }));
    }
  };
}



