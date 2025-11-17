/**
 * EmploymentForm is a form component for adding or editing employment records.
 * It includes fields for employer details and employment questions.
 */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { EmploymentRecord, EmploymentFormData } from '@/types/employment'
import AddressAutoComplete, { type AddressType } from '@/components/ui/address-autocomplete'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import PhoneField from '../ui/fields/PhoneField'
import DateField from '../ui/fields/DateField'

interface EmploymentFormProps {
  record?: EmploymentRecord | null
  isLoading?: boolean
  onFieldBlur?: (field: keyof EmploymentFormData, value: EmploymentFormData[keyof EmploymentFormData]) => void
  onDelete?: () => void
  autoFocus?: boolean
}

export const EmploymentForm: React.FC<EmploymentFormProps> = ({
  record,
  onFieldBlur,
  onDelete,
  autoFocus
}) => {
  const [formData, setFormData] = useState<EmploymentFormData>({
    employerName: '',
    phoneNumber: '',
    jobTitle: '',
    incomeType: '',
    employerAddress: {
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
    selfEmployed: false,
    ownershipPercentage: false,
    relatedParty: false,
    currentlyEmployed: false,
    startDate: '',
    endDate: null,
    hasOfferLetter: false
  })

  const [submitError] = useState<string | null>(null)

  useEffect(() => {
    if (record) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        employerName: record.employerName || '',
        phoneNumber: record.phoneNumber || '',
        jobTitle: record.jobTitle || '',
        incomeType: record.incomeType || '',
        employerAddress: record.employerAddress || {
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
        selfEmployed: record.selfEmployed || false,
        ownershipPercentage: record.ownershipPercentage || false,
        relatedParty: record.relatedParty || false,
        currentlyEmployed: record.currentlyEmployed || false,
        startDate: record.startDate || '',
        endDate: record.endDate ?? null,
        hasOfferLetter: record.hasOfferLetter || false
      })
    }
  }, [record])

  // Note: Auto-save is handled via onFieldBlur callbacks, not via useEffect
  // Removed the formData useEffect to prevent unnecessary re-renders

  const handleInputChange = (field: keyof EmploymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Note: onFieldBlur is called separately in the onBlur handlers, not here
  }

  const handleCheckboxChange = (field: 'selfEmployed' | 'ownershipPercentage' | 'relatedParty' | 'currentlyEmployed' | 'hasOfferLetter') => {
    // Calculate the new values first
    const newValue = !formData[field]
    const updates: Partial<EmploymentFormData> = { [field]: newValue }
    
    // Make currentlyEmployed and hasOfferLetter mutually exclusive
    if (field === 'currentlyEmployed' && newValue) {
      updates.hasOfferLetter = false
      updates.endDate = null
    } else if (field === 'hasOfferLetter' && newValue) {
      updates.currentlyEmployed = false
      updates.endDate = null
    } else if ((field === 'currentlyEmployed' || field === 'hasOfferLetter') && newValue) {
      updates.endDate = null
    }
    
    // Update local state
    setFormData(prev => ({ ...prev, ...updates }))
    
    // Save to store AFTER state update, not during
    setTimeout(() => {
      Object.entries(updates).forEach(([key, value]) => {
        onFieldBlur?.(key as keyof EmploymentFormData, value)
      })
    }, 0)
  }

  const handleAddressChange = useCallback((newAddress: AddressType | null) => {
    const addressToSave = newAddress || {
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
    
    setFormData(prev => ({ ...prev, employerAddress: addressToSave }))
    
    // Call onFieldBlur after state update completes
    setTimeout(() => {
      onFieldBlur?.('employerAddress', addressToSave)
    }, 0)
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

          {/* Basic employment info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employerName">Employer Name</Label>
              <Input
                id="employerName"
                value={formData.employerName}
                onChange={(e) => handleInputChange('employerName', e.target.value)}
                onBlur={(e) => onFieldBlur?.('employerName', e.target.value)}
                placeholder="Enter employer name"
                autoFocus={autoFocus}
              />
            </div>

            <div className="space-y-2">
              <PhoneField
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(v) => handleInputChange('phoneNumber', v)}
                onBlur={(v) => onFieldBlur?.('phoneNumber', v)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                onBlur={(e) => onFieldBlur?.('jobTitle', e.target.value)}
                placeholder="Enter job title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incomeType">Income Type</Label>
              <Select
                value={formData.incomeType}
                onValueChange={(value) => handleInputChange('incomeType', value)}
              >
                <SelectTrigger id="incomeType" onBlur={() => onFieldBlur?.('incomeType', formData.incomeType)}>
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Foreign">Foreign</SelectItem>
                  <SelectItem value="Seasonal">Seasonal</SelectItem>
                  <SelectItem value="TemporaryLeave">Temporary Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 md:col-span-2">
              <Label>Employer Address</Label>
              <AddressAutoComplete
                address={formData.employerAddress as AddressType}
                setAddress={handleAddressChange}
                dialogTitle="Employer Address"
                placeholder="Enter employer address"
              />
            </div>
          </div>

          {/* Employment questions */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Employment Questions</h3>
            <div className="flex items-center space-x-2">
              <Checkbox id="selfEmployed" checked={formData.selfEmployed} onCheckedChange={() => handleCheckboxChange('selfEmployed')} />
              <Label htmlFor="selfEmployed">Is your client self-employed or business owner?</Label>
            </div>
            {formData.selfEmployed && (
              <div className="flex items-center space-x-2 ml-6">
                <Checkbox id="ownershipPercentage" checked={formData.ownershipPercentage} onCheckedChange={() => handleCheckboxChange('ownershipPercentage')} />
                <Label htmlFor="ownershipPercentage">Does he own 25% or more?</Label>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox id="relatedParty" checked={formData.relatedParty} onCheckedChange={() => handleCheckboxChange('relatedParty')} />
              <Label htmlFor="relatedParty">Is your client employed by a family member, property seller, real estate agent or other party in the transaction?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="currentlyEmployed" checked={formData.currentlyEmployed} onCheckedChange={() => handleCheckboxChange('currentlyEmployed')} />
              <Label htmlFor="currentlyEmployed">Is he employed currently on this job?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="hasOfferLetter" checked={formData.hasOfferLetter} onCheckedChange={() => handleCheckboxChange('hasOfferLetter')} />
              <Label htmlFor="hasOfferLetter">Does your client have an offer letter in the future from this employer?</Label>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateField
                id="startDate"
                label="Start Date"
                value={formData.startDate}
                onChange={(value) => handleInputChange('startDate', value)}
                onBlur={(value) => onFieldBlur?.('startDate', value)}
                maxDate={formData.hasOfferLetter ? undefined : new Date().toISOString().split('T')[0]}
                required={true}
              />
              {!formData.currentlyEmployed && !formData.hasOfferLetter && (
                <DateField
                  id="endDate"
                  label="End Date"
                  value={formData.endDate ?? ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, endDate: value || null }))}
                  onBlur={(value) => onFieldBlur?.('endDate', value || null)}
                  maxDate={new Date().toISOString().split('T')[0]}
                  required={false}
                />
              )}
            </div>
          </div>
          {onDelete && (
            <div className="flex justify-end pt-4">
              <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete employment record" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default EmploymentForm
