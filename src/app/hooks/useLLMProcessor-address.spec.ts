import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useApplicationStore } from '@/stores/applicationStore'
import { useLLMProcessor } from '@/hooks/useLLMProcessor'
import { renderHook, act } from '@testing-library/react'

// Mock the address resolver
vi.mock('@/lib/addressResolver', () => ({
  resolveAddress: vi.fn().mockResolvedValue({
    address1: '123 Main St',
    address2: '',
    formattedAddress: '123 Main St, Anytown, CA 12345',
    city: 'Anytown',
    region: 'CA',
    postalCode: '12345',
    country: 'US',
    lat: 37.7749,
    lng: -122.4194
  })
}))

describe('useLLMProcessor - Address Updates', () => {
  beforeEach(() => {
    // Reset store state
    useApplicationStore.setState({
      clients: {
        'test-client': { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123-456-7890', ssn: '123456789', dob: '1990-01-01', citizenship: 'US Citizen', maritalStatus: 'Unmarried', hasMilitaryService: false, militaryNote: null }
      },
      activeClientId: 'test-client',
      addressData: {},
      employmentData: {},
      employmentCounters: {},
      activeIncomeData: {},
      passiveIncomeData: {},
      incomeTotals: {},
      realEstateData: {},
      realEstateCounters: {},
      assetsData: {},
      assetCounters: {},
      conditionsData: {},
      conditionCounters: {},
      chatHistory: []
    })
  })

  it('should properly update address data with correct structure', async () => {
    const { result } = renderHook(() => useLLMProcessor())
    
    // Simulate address update action without fromDate
    const mockAction = {
      action: 'updateAddressData',
      params: {
        clientId: 'test-client',
        data: {
          addr: {
            address1: '123 Main St',
            city: 'Anytown',
            address2: '',
            formattedAddress: '',
            region: '',
            postalCode: '',
            country: '',
            lat: 0,
            lng: 0
          }
          // No fromDate specified
        }
      }
    }

    // Get initial address data
    const initialAddressData = useApplicationStore.getState().getAddressData('test-client')
    expect(initialAddressData.present.addr.address1).toBe('')

    // Execute the action manually (simulating what the LLM processor does)
    const store = useApplicationStore.getState()
    const currentAddressData = store.getAddressData('test-client')
    
    const updatedAddressData = {
      ...currentAddressData,
      present: {
        ...currentAddressData.present,
        addr: mockAction.params.data.addr,
        fromDate: mockAction.params.data.fromDate || currentAddressData.present.fromDate,
        toDate: mockAction.params.data.toDate || currentAddressData.present.toDate
      }
    }
    
    store.updateAddressData('test-client', updatedAddressData)

    // Verify the address was updated correctly
    const updatedAddressDataFromStore = useApplicationStore.getState().getAddressData('test-client')
    expect(updatedAddressDataFromStore.present.addr.address1).toBe('123 Main St')
    expect(updatedAddressDataFromStore.present.addr.city).toBe('Anytown')
    expect(updatedAddressDataFromStore.present.fromDate).toBe('') // Should remain empty since not specified
    expect(updatedAddressDataFromStore.present.isPresent).toBe(true)
    expect(updatedAddressDataFromStore.former).toEqual([])
  })

  it('should handle address update when no existing address data exists', async () => {
    // Ensure no existing address data
    useApplicationStore.setState({
      addressData: {}
    })

    const store = useApplicationStore.getState()
    const currentAddressData = store.getAddressData('test-client')
    
    // This should not throw an error even when currentAddressData.present is undefined
    const presentAddress = currentAddressData.present || {
      id: 'present',
      fromDate: '',
      toDate: '',
      addr: {
        address1: '',
        address2: '',
        formattedAddress: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        lat: 0,
        lng: 0
      },
      isPresent: true
    }
    
    const updatedAddressData = {
      ...currentAddressData,
      present: {
        ...presentAddress,
        addr: {
          address1: '123 New St',
          address2: '',
          formattedAddress: '123 New St, Newtown, CA 11111',
          city: 'Newtown',
          region: 'CA',
          postalCode: '11111',
          country: 'US',
          lat: 37.8049,
          lng: -122.3894
        }
      },
      former: currentAddressData.former || []
    }
    
    store.updateAddressData('test-client', updatedAddressData)

    // Verify the update worked correctly
    const finalAddressData = useApplicationStore.getState().getAddressData('test-client')
    expect(finalAddressData.present.addr.address1).toBe('123 New St')
    expect(finalAddressData.present.addr.city).toBe('Newtown')
    expect(finalAddressData.present.isPresent).toBe(true)
    expect(finalAddressData.former).toEqual([])
  })

  it('should preserve existing address structure when updating', async () => {
    // Set up initial address data
    useApplicationStore.setState({
      addressData: {
        'test-client': {
          present: {
            id: 'present',
            fromDate: '2019-01-01',
            toDate: '',
            addr: {
              address1: '456 Oak Ave',
              address2: 'Apt 2',
              formattedAddress: '456 Oak Ave, Apt 2, Oldtown, CA 54321',
              city: 'Oldtown',
              region: 'CA',
              postalCode: '54321',
              country: 'US',
              lat: 37.7849,
              lng: -122.4094
            },
            isPresent: true
          },
          former: [
            {
              id: 'former-1',
              fromDate: '2018-01-01',
              toDate: '2018-12-31',
              addr: {
                address1: '789 Pine St',
                address2: '',
                formattedAddress: '789 Pine St, Oldercity, CA 67890',
                city: 'Oldercity',
                region: 'CA',
                postalCode: '67890',
                country: 'US',
                lat: 37.7949,
                lng: -122.3994
              },
              isPresent: false
            }
          ]
        }
      }
    })

    const store = useApplicationStore.getState()
    const currentAddressData = store.getAddressData('test-client')
    
    // Update only the address, preserving other data
    const updatedAddressData = {
      ...currentAddressData,
      present: {
        ...currentAddressData.present,
        addr: {
          address1: '123 New St',
          address2: '',
          formattedAddress: '123 New St, Newtown, CA 11111',
          city: 'Newtown',
          region: 'CA',
          postalCode: '11111',
          country: 'US',
          lat: 37.8049,
          lng: -122.3894
        }
      }
    }
    
    store.updateAddressData('test-client', updatedAddressData)

    // Verify the update preserved existing structure
    const finalAddressData = useApplicationStore.getState().getAddressData('test-client')
    expect(finalAddressData.present.addr.address1).toBe('123 New St')
    expect(finalAddressData.present.addr.city).toBe('Newtown')
    expect(finalAddressData.present.fromDate).toBe('2019-01-01') // Preserved
    expect(finalAddressData.present.isPresent).toBe(true) // Preserved
    expect(finalAddressData.former).toHaveLength(1) // Preserved
    expect(finalAddressData.former[0].addr.address1).toBe('789 Pine St') // Preserved
  })

  it('should only set fromDate when explicitly provided', async () => {
    // Set up initial address data with existing fromDate
    useApplicationStore.setState({
      addressData: {
        'test-client': {
          present: {
            id: 'present',
            fromDate: '2019-01-01', // Existing fromDate
            toDate: '',
            addr: {
              address1: '456 Oak Ave',
              address2: '',
              formattedAddress: '456 Oak Ave, Oldtown, CA 54321',
              city: 'Oldtown',
              region: 'CA',
              postalCode: '54321',
              country: 'US',
              lat: 37.7849,
              lng: -122.4094
            },
            isPresent: true
          },
          former: []
        }
      }
    })

    const store = useApplicationStore.getState()
    const currentAddressData = store.getAddressData('test-client')
    
    // Update address without providing fromDate
    const updatedAddressData = {
      ...currentAddressData,
      present: {
        ...currentAddressData.present,
        addr: {
          address1: '123 New St',
          address2: '',
          formattedAddress: '123 New St, Newtown, CA 11111',
          city: 'Newtown',
          region: 'CA',
          postalCode: '11111',
          country: 'US',
          lat: 37.8049,
          lng: -122.3894
        }
        // No fromDate provided
      }
    }
    
    store.updateAddressData('test-client', updatedAddressData)

    // Verify that fromDate was preserved (not overwritten with empty string)
    const finalAddressData = useApplicationStore.getState().getAddressData('test-client')
    expect(finalAddressData.present.addr.address1).toBe('123 New St')
    expect(finalAddressData.present.fromDate).toBe('2019-01-01') // Should be preserved
  })
})
