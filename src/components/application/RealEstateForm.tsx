/**
 * RealEstateForm is a form component for adding or editing real estate owned records.
 * It includes fields for property details, address, and property questions.
 */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { RealEstateOwned, RealEstateFormData } from '@/types/real-estate'
import AddressAutoComplete, { type AddressType } from '@/components/ui/address-autocomplete'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { MoneyInput } from '@/components/ui/fields/MoneyInput'
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, OCCUPANCY_TYPE_LABELS } from '@/types/real-estate'

interface RealEstateFormProps {
  record?: RealEstateOwned | null
  isLoading?: boolean
  onFieldBlur?: (field: keyof RealEstateFormData, value: RealEstateFormData[keyof RealEstateFormData]) => void
  onDelete?: () => void
}

export const RealEstateForm: React.FC<RealEstateFormProps> = ({
  record,
  onFieldBlur,
  onDelete
}) => {
  const [formData, setFormData] = useState<RealEstateFormData>({
    address: {
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
    propertyType: '',
    propertyStatus: '',
    occupancyType: '',
    monthlyTaxes: 0,
    monthlyInsurance: 0,
    currentResidence: false,
    propertyValue: 0
  })

  const [submitError] = useState<string | null>(null)

  useEffect(() => {
    if (record) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        address: record.address || {
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
        propertyType: record.propertyType || '',
        propertyStatus: record.propertyStatus || '',
        occupancyType: record.occupancyType || '',
        monthlyTaxes: record.monthlyTaxes || 0,
        monthlyInsurance: record.monthlyInsurance || 0,
        currentResidence: record.currentResidence || false,
        propertyValue: record.propertyValue || 0
      })
    }
  }, [record])

  // Note: Auto-save is handled via onFieldBlur callbacks, not via useEffect
  // Removed the formData useEffect to prevent unnecessary re-renders

  const handleInputChange = (field: keyof RealEstateFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckboxChange = (field: 'currentResidence') => {
    const newValue = !formData[field]
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }))
    // Immediately call onFieldBlur to trigger the logic in the parent
    onFieldBlur?.(field, newValue)
  }

  const handleAddressChange = useCallback((newAddress: AddressType | null) => {
    if (newAddress) {
      setFormData(prev => ({ ...prev, address: newAddress }))
      onFieldBlur?.('address', newAddress)
    } else {
      const emptyAddr: AddressType = {
        address1: '', 
        address2: '', 
        formattedAddress: '', 
        city: '', 
        region: '', 
        postalCode: '', 
        country: '', 
        lat: 0, 
        lng: 0
      }
      setFormData(prev => ({ ...prev, address: emptyAddr }))
      onFieldBlur?.('address', emptyAddr)
    }
  }, [onFieldBlur])

  return (
    <Card className="w-full">
      <CardHeader>
      
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Property Address */}
          <div className="space-y-4">
            <Label>Property Address</Label>
            <AddressAutoComplete
              address={formData.address as AddressType}
              setAddress={handleAddressChange}
              dialogTitle="Property Address"
              placeholder="Enter property address"
            />
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => handleInputChange('propertyType', value)}
              >
                <SelectTrigger id="propertyType" onBlur={() => onFieldBlur?.('propertyType', formData.propertyType)}>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyStatus">Property Status</Label>
              <Select
                value={formData.propertyStatus}
                onValueChange={(value) => handleInputChange('propertyStatus', value)}
              >
                <SelectTrigger id="propertyStatus" onBlur={() => onFieldBlur?.('propertyStatus', formData.propertyStatus)}>
                  <SelectValue placeholder="Select property status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupancyType">Occupancy Type</Label>
              <Select
                value={formData.occupancyType}
                onValueChange={(value) => handleInputChange('occupancyType', value)}
              >
                <SelectTrigger id="occupancyType" onBlur={() => onFieldBlur?.('occupancyType', formData.occupancyType)}>
                  <SelectValue placeholder="Select occupancy type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OCCUPANCY_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyValue">Property Value</Label>
              <MoneyInput
                id="propertyValue"
                value={formData.propertyValue}
                onChange={(value) => handleInputChange('propertyValue', value)}
                onBlur={() => onFieldBlur?.('propertyValue', formData.propertyValue)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyTaxes">Monthly Taxes</Label>
              <MoneyInput
                id="monthlyTaxes"
                value={formData.monthlyTaxes}
                onChange={(value) => handleInputChange('monthlyTaxes', value)}
                onBlur={() => onFieldBlur?.('monthlyTaxes', formData.monthlyTaxes)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyInsurance">Monthly Insurance</Label>
              <MoneyInput
                id="monthlyInsurance"
                value={formData.monthlyInsurance}
                onChange={(value) => handleInputChange('monthlyInsurance', value)}
                onBlur={() => onFieldBlur?.('monthlyInsurance', formData.monthlyInsurance)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Property Questions */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Property Questions</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="currentResidence"
                checked={formData.currentResidence}
                onChange={() => handleCheckboxChange('currentResidence')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="currentResidence">Is this property your client&apos;s current residence?</Label>
            </div>
          </div>

          {onDelete && (
            <div className="flex justify-end pt-4">
              <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete real estate record" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RealEstateForm
