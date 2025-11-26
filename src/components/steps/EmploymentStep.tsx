/**
 * EmploymentStep is the main component for the employment information collection step in the application process.
 * It manages the display of employment records, editing/adding new records, and navigation.
 */
'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EmploymentFormWrapper } from '@/components/application/EmploymentFormWrapper'
import EmploymentNote from '@/components/application/EmploymentNote'
import ClientTabs from './ClientTabs'
import {
  useEmploymentRecords,
  useEmploymentActions,
  useEmploymentCallbacks,
  useShouldShowEmploymentNote
} from './EmploymentStep.hooks'

export default function EmploymentStep() {
  const { activeClientId, employmentRecords } = useEmploymentRecords()
  const {
    addEmploymentRecord,
    updateEmploymentRecordRef,
    removeEmploymentRecordRef,
    activeClientIdRef
  } = useEmploymentActions()
  
  const { handleBlurSave, handleDelete } = useEmploymentCallbacks(
    updateEmploymentRecordRef,
    removeEmploymentRecordRef,
    activeClientIdRef
  )
  
  const shouldShowEmploymentNote = useShouldShowEmploymentNote(employmentRecords)
  
  const [newlyAddedRecordId, setNewlyAddedRecordId] = useState<string | null>(null)

  const handleAddEmployer = useCallback(() => {
    const newRecordId = addEmploymentRecord(activeClientId)
    setNewlyAddedRecordId(newRecordId)
    // Clear the newly added marker after a short delay so next render doesn't auto-focus
    setTimeout(() => {
      setNewlyAddedRecordId(null)
    }, 100)
  }, [activeClientId, addEmploymentRecord])
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Client tabs */}
      <ClientTabs />

      <div className="space-y-4">
        {employmentRecords.map((rec) => (
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


