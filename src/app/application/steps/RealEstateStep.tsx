/**
 * RealEstateStep is the main component for the real estate owned information collection step in the application process.
 * It manages the display of real estate records, editing/adding new records, and navigation.
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useApplicationStore } from '@/stores/applicationStore'
import type { RealEstateOwned, RealEstateFormData } from '@/types/real-estate'
import { RealEstateForm } from '@/components/application/RealEstateForm'
import ClientTabs from './ClientTabs'

export default function RealEstateStep() {
  const {
    activeClientId,
    realEstateData,
    addRealEstateRecord,
    updateRealEstateRecord,
    removeRealEstateRecord,
    getNextRealEstateId,
    markRealEstateVisited
  } = useApplicationStore()

  // Mark this step as visited when component mounts
  useEffect(() => {
    markRealEstateVisited(activeClientId)
  }, [activeClientId, markRealEstateVisited])

  const realEstateRecords: RealEstateOwned[] = realEstateData[activeClientId]?.records || []

  const nextRecordId = () => getNextRealEstateId(activeClientId)

  const handleBlurSave = (recordId: string, field: keyof RealEstateFormData, value: RealEstateFormData[keyof RealEstateFormData]) => {
    // If marking as current residence, unmark all other properties
    if (field === 'currentResidence' && value === true) {
      // First, unmark all other properties as current residence
      realEstateRecords.forEach(record => {
        if (record.id !== recordId && record.currentResidence) {
          updateRealEstateRecord(activeClientId, record.id, { currentResidence: false })
        }
      })
    }
    
    updateRealEstateRecord(activeClientId, recordId, { [field]: value })
  }

  const handleDelete = (recordId: string) => {
    removeRealEstateRecord(activeClientId, recordId)
  }

  const handleAddProperty = () => {
    addRealEstateRecord(activeClientId)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Client tabs */}
      <ClientTabs />

      <div className="space-y-4">
        {realEstateRecords.map((rec) => (
          <RealEstateForm
            key={rec.id}
            record={rec}
            isLoading={false}
            onFieldBlur={(field, value) => handleBlurSave(rec.id, field, value)}
            onDelete={() => handleDelete(rec.id)}
          />
        ))}
      </div>

      <div className="mt-4">
        <Button onClick={handleAddProperty} variant="secondary">
          <Plus className="mr-2 h-4 w-4" /> Add Property
        </Button>
      </div>
    </div>
  )
}


