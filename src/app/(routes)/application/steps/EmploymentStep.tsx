/**
 * EmploymentStep is the main component for the employment information collection step in the application process.
 * It manages the display of employment records, editing/adding new records, and navigation.
 */
'use client'

import { useCallback, memo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useApplicationStore } from '@/stores/applicationStore'
import type { EmploymentRecord, EmploymentFormData } from '@/types/employment'
import { EmploymentForm } from '@/components/application/EmploymentForm'
import EmploymentNote from '@/components/application/EmploymentNote'
import ClientTabs from './ClientTabs'

// Wrapper component to memoize callbacks per record
const EmploymentFormWrapper = memo(({ 
  record, 
  onBlurSave, 
  onDelete,
  autoFocus
}: { 
  record: EmploymentRecord
  onBlurSave: (recordId: string, field: keyof EmploymentFormData, value: EmploymentFormData[keyof EmploymentFormData]) => void
  onDelete: (recordId: string) => void
  autoFocus?: boolean
}) => {
  const handleFieldBlur = useCallback((field: keyof EmploymentFormData, value: EmploymentFormData[keyof EmploymentFormData]) => {
    onBlurSave(record.id, field, value)
  }, [record.id, onBlurSave])

  const handleDelete = useCallback(() => {
    onDelete(record.id)
  }, [record.id, onDelete])

  return (
    <EmploymentForm
      record={record}
      isLoading={false}
      onFieldBlur={handleFieldBlur}
      onDelete={handleDelete}
      autoFocus={autoFocus}
    />
  )
})

EmploymentFormWrapper.displayName = 'EmploymentFormWrapper'

export default function EmploymentStep() {
  const {
    activeClientId,
    employmentData,
    addEmploymentRecord,
    updateEmploymentRecord,
    removeEmploymentRecord
  } = useApplicationStore()

  const [newlyAddedRecordId, setNewlyAddedRecordId] = useState<string | null>(null)

  const employmentRecords: EmploymentRecord[] = employmentData[activeClientId]?.records || []

  // Check if employment note should be shown (less than 2 years of history)
  const shouldShowEmploymentNote = (() => {
    if (!employmentRecords.length) return false

    const now = new Date()
    let totalMonths = 0

    for (const record of employmentRecords) {
      if (record.startDate && record.employerName?.trim()) {
        const startDate = new Date(record.startDate)
        const endDate = record.endDate ? new Date(record.endDate) : now
        
        if (startDate <= endDate) {
          const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth())
          totalMonths += Math.max(0, months)
        }
      }
    }
    
    return totalMonths < 24 // Less than 2 years
  })()

  const handleBlurSave = useCallback((recordId: string, field: keyof EmploymentFormData, value: EmploymentFormData[keyof EmploymentFormData]) => {
    updateEmploymentRecord(activeClientId, recordId, { [field]: value })
  }, [activeClientId, updateEmploymentRecord])

  const handleDelete = useCallback((recordId: string) => {
    removeEmploymentRecord(activeClientId, recordId)
  }, [activeClientId, removeEmploymentRecord])

  const handleAddEmployer = useCallback(() => {
    const newRecordId = addEmploymentRecord(activeClientId)
    setNewlyAddedRecordId(newRecordId)
    // Clear the newly added marker after a short delay so next render doesn't auto-focus
    setTimeout(() => setNewlyAddedRecordId(null), 100)
  }, [activeClientId, addEmploymentRecord])

  // Always render all persisted records plus one empty placeholder at the end
  const recordsToRender = employmentRecords

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Client tabs */}
      <ClientTabs />

      <div className="space-y-4">
        {recordsToRender.map((rec) => (
          <EmploymentFormWrapper
            key={rec.id}
            record={rec}
            onBlurSave={handleBlurSave}
            onDelete={handleDelete}
            autoFocus={rec.id === newlyAddedRecordId}
          />
        ))}
      </div>

      {/* Show employment note if less than 2 years of history */}
      {shouldShowEmploymentNote && (
        <EmploymentNote clientId={activeClientId} />
      )}

      <div className="mt-4">
        <Button onClick={handleAddEmployer} variant="secondary">
          <Plus className="mr-2 h-4 w-4" /> Add Employer
        </Button>
      </div>
    </div>
  )
}


