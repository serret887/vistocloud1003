/**
 * EmploymentStep is the main component for the employment information collection step in the application process.
 * It manages the display of employment records, editing/adding new records, and navigation.
 */
'use client'

import { useCallback, memo, useState, useMemo, useRef, useEffect } from 'react'
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
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if record data actually changed or callbacks changed
  // Compare by ID and updatedAt to detect actual data changes (updatedAt changes when record is modified)
  if (prevProps.record.id !== nextProps.record.id) return false
  if (prevProps.record.updatedAt !== nextProps.record.updatedAt) return false
  if (prevProps.onBlurSave !== nextProps.onBlurSave) return false
  if (prevProps.onDelete !== nextProps.onDelete) return false
  if (prevProps.autoFocus !== nextProps.autoFocus) return false
  
  // If all the above are the same, skip re-render (return true means props are equal)
  return true
})

EmploymentFormWrapper.displayName = 'EmploymentFormWrapper'

// Stable empty array to prevent creating new arrays on every selector call
const EMPTY_RECORDS: EmploymentRecord[] = []

export default function EmploymentStep() {
  // Use selectors to only subscribe to specific parts of the store
  const activeClientId = useApplicationStore((state) => state.activeClientId)
  
  // Get the employment data object for the active client
  // This selector returns the entire object, which has a stable reference when unchanged
  const clientEmploymentData = useApplicationStore(
    (state) => state.employmentData[activeClientId]
  )
  
  // Get all employment data to debug
  const allEmploymentData = useApplicationStore((state) => state.employmentData)
  
  // Extract records with stable empty array fallback
  // This useMemo ensures we return the same EMPTY_RECORDS reference when no records exist
  const employmentRecords: EmploymentRecord[] = useMemo(() => {
    const records = clientEmploymentData?.records ?? EMPTY_RECORDS
    console.log(`[EmploymentStep] Active client: ${activeClientId}, Records count: ${records.length}`, {
      allEmploymentDataKeys: Object.keys(allEmploymentData),
      clientEmploymentData: clientEmploymentData ? { clientId: clientEmploymentData.clientId, recordCount: clientEmploymentData.records.length } : null,
      records: records.map(r => ({ id: r.id, employerName: r.employerName }))
    })
    return records
  }, [clientEmploymentData?.records, activeClientId, allEmploymentData])
  
  // Get store actions - these should be stable in Zustand
  const addEmploymentRecord = useApplicationStore((state) => state.addEmploymentRecord)
  const updateEmploymentRecord = useApplicationStore((state) => state.updateEmploymentRecord)
  const removeEmploymentRecord = useApplicationStore((state) => state.removeEmploymentRecord)

  const [newlyAddedRecordId, setNewlyAddedRecordId] = useState<string | null>(null)
  
  // Store callbacks in refs to prevent re-renders when they change
  const updateEmploymentRecordRef = useRef(updateEmploymentRecord)
  const removeEmploymentRecordRef = useRef(removeEmploymentRecord)
  const activeClientIdRef = useRef(activeClientId)
  
  useEffect(() => {
    updateEmploymentRecordRef.current = updateEmploymentRecord
    removeEmploymentRecordRef.current = removeEmploymentRecord
    activeClientIdRef.current = activeClientId
  }, [updateEmploymentRecord, removeEmploymentRecord, activeClientId])

  // Check if employment note should be shown (less than 2 years of history)
  const shouldShowEmploymentNote = useMemo(() => {
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
  }, [employmentRecords])

  // Use refs in callbacks to avoid dependency on changing functions
  const handleBlurSave = useCallback((recordId: string, field: keyof EmploymentFormData, value: EmploymentFormData[keyof EmploymentFormData]) => {
    updateEmploymentRecordRef.current(activeClientIdRef.current, recordId, { [field]: value })
  }, []) // Empty deps - use refs instead

  const handleDelete = useCallback((recordId: string) => {
    removeEmploymentRecordRef.current(activeClientIdRef.current, recordId)
  }, []) // Empty deps - use refs instead

  const handleAddEmployer = useCallback(() => {
    const newRecordId = addEmploymentRecord(activeClientId)
    setNewlyAddedRecordId(newRecordId)
    // Clear the newly added marker after a short delay so next render doesn't auto-focus
    setTimeout(() => setNewlyAddedRecordId(null), 100)
  }, [activeClientId, addEmploymentRecord])

  // Always render all persisted records plus one empty placeholder at the end
  const recordsToRender = employmentRecords
console.log("EmploymentStep is being rendered")
console.log(recordsToRender)
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


