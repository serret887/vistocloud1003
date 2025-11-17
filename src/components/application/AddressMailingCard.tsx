'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import AddressAutoComplete, { type AddressType } from '@/components/ui/address-autocomplete'

type ClientMailingData = {
  sameAsPresent: boolean
  addr: AddressType
}

export default function AddressMailingCard() {
  const [currentId, setCurrentId] = useState<string>('c1') // Default to first client
  const [data, setData] = useState<{ [id: string]: ClientMailingData }>({})

  useEffect(() => {
    const onActive = (e: Event) => {
      const ce = e as CustomEvent<{ id: string }>
      setCurrentId(ce.detail.id)
    }
    window.addEventListener('client:active', onActive as EventListener)
    return () => window.removeEventListener('client:active', onActive as EventListener)
  }, [])

  const currentData = data[currentId] || {
    sameAsPresent: true,
    addr: { address1: '', address2: '', formattedAddress: '', city: '', region: '', postalCode: '', country: '', lat: 0, lng: 0 }
  }

  const updateData = useCallback((updates: Partial<ClientMailingData>) => {
    setData(prev => {
      const current = prev[currentId] || {
        sameAsPresent: true,
        addr: { address1: '', address2: '', formattedAddress: '', city: '', region: '', postalCode: '', country: '', lat: 0, lng: 0 }
      };
      return {
        ...prev,
        [currentId]: { ...current, ...updates }
      };
    });
  }, [currentId])

  const handleAddressChange = useCallback((addr: AddressType) => {
    updateData({ addr });
  }, [updateData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mailing Address</CardTitle>
        <CardDescription>The client's mailing address is their present address.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={currentData.sameAsPresent} onChange={e => updateData({ sameAsPresent: e.target.checked })} />
          The client's mailing address is their present address.
        </label>
        <div className="space-y-2">
          <Label>Street Address</Label>
          {currentData.sameAsPresent ? (
            <div className="text-xs opacity-70">Using present address</div>
          ) : (
            <AddressAutoComplete address={currentData.addr} setAddress={handleAddressChange} dialogTitle="Enter Mailing Address" placeholder="Start typing address…" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
