'use client'

import { useEffect, useMemo, useState, useCallback, memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import AddressAutoComplete from '@/components/ui/address-autocomplete'
import DateField from '@/components/ui/fields/DateField'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import ValidationSuccessAlert from '@/components/ui/ValidationSuccessAlert'
import type { ClientAddressData, AddressRecord, AddressValidationResult } from '@/types/address'
import { useApplicationStore } from '@/stores/applicationStore'
import { generateFallbackId } from '@/lib/idGenerator'

// Memoized component for former address items to prevent unnecessary re-renders
const FormerAddressItem = memo(({
  formerAddress,
  newlyAddedAddressId,
  onAddressChange,
  onFieldBlur,
  onRemove
}: {
  formerAddress: AddressRecord
  newlyAddedAddressId: string | null
  onAddressChange: (id: string, addr: AddressRecord['addr']) => void
  onFieldBlur: (id: string, field: keyof AddressRecord, value: string) => void
  onRemove: (id: string) => void
}) => {
  const handleAddressChange = useCallback((addr: AddressRecord['addr']) => {
    onAddressChange(formerAddress.id, addr)
  }, [formerAddress.id, onAddressChange])

  const handleRemove = useCallback(() => {
    onRemove(formerAddress.id)
  }, [formerAddress.id, onRemove])

  return (
    <div className="space-y-4 border-b pb-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Street Address</Label>
          <AddressAutoComplete 
            address={formerAddress.addr} 
            setAddress={handleAddressChange} 
            dialogTitle="Enter Former Address" 
            placeholder="Start typing address…"
            autoFocus={formerAddress.id === newlyAddedAddressId}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateField
            id={`fromDate-${formerAddress.id}`}
            label="From Date"
            value={formerAddress.fromDate}
            onBlur={(value) => onFieldBlur(formerAddress.id, 'fromDate', value)}
            maxDate={new Date().toISOString().split('T')[0]}
            required={true}
          />
          <DateField
            id={`toDate-${formerAddress.id}`}
            label="To Date"
            value={formerAddress.toDate}
            onBlur={(value) => onFieldBlur(formerAddress.id, 'toDate', value)}
            maxDate={new Date().toISOString().split('T')[0]}
            required={true}
          />
        </div>
        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleRemove}>Remove</Button>
        </div>
      </div>
    </div>
  )
})

FormerAddressItem.displayName = 'FormerAddressItem'

export default function AddressPresentCard() {
  const [currentId, setCurrentId] = useState<string>('')
  const [attemptedContinue] = useState(false)
  const [newlyAddedAddressId, setNewlyAddedAddressId] = useState<string | null>(null)
  
  const { activeClientId, getAddressData, updateAddressData, addFormerAddress, updateFormerAddress, removeFormerAddress } = useApplicationStore()

  useEffect(() => {
    const onActive = (e: Event) => {
      const ce = e as CustomEvent<{ id: string }>
      setCurrentId(ce.detail.id)
    }
    window.addEventListener('client:active', onActive as EventListener)
    return () => window.removeEventListener('client:active', onActive as EventListener)
  }, [])

  const clientId = currentId || activeClientId
  const currentData = getAddressData(clientId) || {
    present: {
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
        lng: 0,
      },
      isPresent: true
    },
    former: []
  }

  const updateData = (updates: Partial<ClientAddressData>) => {
    updateAddressData(clientId, { ...currentData, ...updates })
  }

  const updatePresent = (updates: Partial<typeof currentData.present>) => {
    updateData({ present: { ...currentData.present, ...updates } });
  };

  const handlePresentFieldBlur = (field: keyof typeof currentData.present, value: string) => {
    updatePresent({ [field]: value });
  };

  const handleFormerFieldBlur = (addressId: string, field: keyof AddressRecord, value: string) => {
    updateFormer(addressId, { [field]: value });
  };
  const addFormer = () => {
    const id = generateFallbackId();
    
    // Auto-fill toDate with the fromDate of the previous address to avoid gaps
    let autoToDate = '';
    if (currentData?.former && currentData.former.length > 0) {
      // Use the last former address's fromDate
      const lastFormer = currentData.former[currentData.former.length - 1];
      autoToDate = lastFormer.fromDate || '';
    } else if (currentData?.present) {
      // Use the present address's fromDate
      autoToDate = currentData.present.fromDate || '';
    }
    
    const newAddress: AddressRecord = { 
      id, 
      fromDate: '', 
      toDate: autoToDate, 
      addr: {
        address1: '',
        address2: '',
        formattedAddress: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        lat: 0,
        lng: 0,
      },
      isPresent: false
    };
    addFormerAddress(clientId, newAddress);
    setNewlyAddedAddressId(id);
    // Focus will be handled in the AddressAutoComplete component
    setTimeout(() => setNewlyAddedAddressId(null), 100);
  };
  
  const updateFormer = (fid: string, updates: Partial<AddressRecord>) => {
    updateFormerAddress(clientId, fid, updates);
  };
  
  const removeFormer = (fid: string) => {
    removeFormerAddress(clientId, fid);
  };

  // Memoized callbacks to prevent infinite re-renders
  const handlePresentAddressChange = useCallback((a: typeof currentData.present.addr) => {
    updatePresent({ addr: a });
  }, [updatePresent]);

  const handleFormerAddressChange = useCallback((fid: string, a: typeof currentData.present.addr) => {
    updateFormer(fid, { addr: a });
  }, [updateFormer]);

  useEffect(() => {
    const handler = () => {
      // Temporarily disable validation to test address clearing
      // const hasAddress = currentData.present.addr.formattedAddress && currentData.present.addr.formattedAddress.trim() !== ''
      // const hasFromDate = currentData.present.fromDate && currentData.present.fromDate.trim() !== ''
      
      // if (!hasAddress || !hasFromDate) {
      //   setAttemptedContinue(true)
      //   e.preventDefault()
      // }
    }
    window.addEventListener('application:attempt-continue', handler)
    return () => window.removeEventListener('application:attempt-continue', handler)
  }, [currentData?.present?.addr?.formattedAddress, currentData?.present?.fromDate])

  // Calculate total months from date ranges
  const calculateMonthsBetween = (fromDate: string, toDate: string): number => {
    if (!fromDate) return 0;
    
    const from = new Date(fromDate);
    const to = toDate ? new Date(toDate) : new Date(); // Use current date if no end date (present address)
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0;
    
    const yearDiff = to.getFullYear() - from.getFullYear();
    const monthDiff = to.getMonth() - from.getMonth();
    
    return yearDiff * 12 + monthDiff;
  };

  const totalMonths = useMemo(() => {
    if (!currentData?.present) return 0;
    const presentMonths = calculateMonthsBetween(currentData.present.fromDate, currentData.present.toDate);
    const formerMonths = (currentData.former || []).reduce((sum, item) => {
      return sum + calculateMonthsBetween(item.fromDate, item.toDate);
    }, 0);
    return presentMonths + formerMonths;
  }, [currentData]);

  const validationResult: AddressValidationResult = useMemo(() => {
    const requiredMonths = 24; // 2 years
    const missingMonths = Math.max(0, requiredMonths - totalMonths);
    const errors: string[] = [];
    
    if (attemptedContinue && totalMonths < requiredMonths) {
      errors.push(`You need to provide at least 2 years (24 months) of address history. You currently have ${totalMonths} months.`);
    }
    
    if (!currentData?.present) {
      return {
        isValid: false,
        totalMonths: 0,
        requiredMonths,
        missingMonths: requiredMonths,
        errors: ['Address data not initialized']
      };
    }
    
    // Collect all address periods for overlap and consecutive validation
    const allAddresses = [
      { ...currentData.present, name: 'Present address' },
      ...(currentData.former || []).map((item, index) => ({ ...item, name: `Former address ${index + 1}` }))
    ].filter(addr => addr.fromDate); // Only include addresses with from dates
    
    // Validate individual date ranges
    allAddresses.forEach((addr) => {
      if (addr.fromDate && addr.toDate) {
        const from = new Date(addr.fromDate);
        const to = new Date(addr.toDate);
        if (from > to) {
          errors.push(`${addr.name}: From date cannot be after To date.`);
        }
      }
    });
    
    // Check for overlaps and ensure consecutive periods
    const sortedAddresses = allAddresses
      .map(addr => ({
        ...addr,
        fromDate: new Date(addr.fromDate),
        toDate: addr.toDate ? new Date(addr.toDate) : new Date() // Use current date if no end date
      }))
      .sort((a, b) => a.fromDate.getTime() - b.fromDate.getTime());
    
    // Check for overlaps
    for (let i = 0; i < sortedAddresses.length - 1; i++) {
      const current = sortedAddresses[i];
      const next = sortedAddresses[i + 1];
      
      if (current.toDate > next.fromDate) {
        errors.push(`Address periods cannot overlap. ${current.name} and ${next.name} have overlapping dates.`);
      }
    }
    
    // Check for gaps (non-consecutive periods)
    for (let i = 0; i < sortedAddresses.length - 1; i++) {
      const current = sortedAddresses[i];
      const next = sortedAddresses[i + 1];
      
      const currentEnd = new Date(current.toDate);
      const nextStart = new Date(next.fromDate);
      
      // Check if there's a gap of more than 1 day between periods
      const timeDiff = nextStart.getTime() - currentEnd.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 1) {
        errors.push(`Address periods must be consecutive. There is a gap between ${current.name} and ${next.name}.`);
      }
    }
    
    return {
      isValid: errors.length === 0 && totalMonths >= requiredMonths,
      totalMonths,
      requiredMonths,
      missingMonths,
      errors
    };
  }, [currentData, totalMonths, attemptedContinue]);

  const showHousingError = attemptedContinue && !validationResult.isValid

  return (
    <Card>
      <CardHeader>
        <CardTitle>Present Address</CardTitle>
        <CardDescription>Provide the current residence details and duration. Address periods must be consecutive with no gaps or overlaps.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Street Address *</Label>
            <AddressAutoComplete 
              address={currentData?.present?.addr || {
                address1: '',
                address2: '',
                formattedAddress: '',
                city: '',
                region: '',
                postalCode: '',
                country: '',
                lat: 0,
                lng: 0,
              }} 
              setAddress={handlePresentAddressChange} 
              dialogTitle="Enter Address" 
              placeholder="Start typing address…" 
            />
            {/* Temporarily disabled validation display */}
            {/* {attemptedContinue && (!currentData.present.addr.formattedAddress || currentData.present.addr.formattedAddress.trim() === '') && (
              <div role="alert" className="text-xs text-red-600">Please enter a street address</div>
            )} */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateField
              id="fromDate"
              label="From Date *"
              value={currentData?.present?.fromDate || ''}
              onBlur={(value) => handlePresentFieldBlur('fromDate', value)}
              maxDate={new Date().toISOString().split('T')[0]}
              required={false}
            />
          </div>
        </div>
        {showHousingError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>You need to provide at least 2 years of address history.</div>
                <div>You currently have {Math.round(totalMonths / 12 * 10) / 10} years. Missing: {Math.round(validationResult.missingMonths / 12 * 10) / 10} years.</div>
                {validationResult.errors.length > 0 && (
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
       
        {(totalMonths < 24 || (currentData?.former && currentData.former.length > 0)) && (
          <>
        <Separator className="my-4" />
        <div>
          <h3 className="text-lg font-medium">Former Addresses</h3>
          <p className="text-sm text-gray-600 mt-1">Add previous addresses in chronological order. Each period should connect to the next without gaps or overlaps.</p>
        </div>
        {(currentData?.former || []).map((f) => (
          <FormerAddressItem
            key={f.id}
            formerAddress={f}
            newlyAddedAddressId={newlyAddedAddressId}
            onAddressChange={handleFormerAddressChange}
            onFieldBlur={handleFormerFieldBlur}
            onRemove={removeFormer}
          />
        ))}
        {totalMonths < 24 && (
          <Button variant="secondary" onClick={addFormer}>Add Former Address</Button>
        )}
        </>
      )}
       <ValidationSuccessAlert 
          message={`Address history requirement met (${Math.round(totalMonths / 12 * 10) / 10} years)`}
          isValid={!showHousingError && totalMonths >= 24}
        />
      </CardContent>
    </Card>
  )
}
