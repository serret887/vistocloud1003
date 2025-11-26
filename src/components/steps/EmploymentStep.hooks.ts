/**
 * Custom hooks for EmploymentStep component
 */
'use client'

import { useMemo, useRef, useCallback } from 'react'
import { useApplicationStore } from '@/stores/applicationStore'
import type { EmploymentRecord, EmploymentFormData } from '@/types/employment'

// Stable empty array to prevent creating new arrays on every selector call
const EMPTY_RECORDS: EmploymentRecord[] = []

/**
 * Hook to get employment records for the active client
 * Optimized to use a single selector to prevent double renders
 */
export function useEmploymentRecords() {
  // Use a single selector that returns both values to prevent double renders
  const { activeClientId, employmentRecords } = useApplicationStore((state) => {
    const clientId = state.activeClientId
    const clientEmploymentData = state.employmentData[clientId]
    return {
      activeClientId: clientId,
      employmentRecords: clientEmploymentData?.records ?? EMPTY_RECORDS
    }
  })
  
  return { activeClientId, employmentRecords }
}

/**
 * Hook to get employment store actions and manage refs
 */
export function useEmploymentActions() {
  const activeClientId = useApplicationStore((state) => state.activeClientId)
  const addEmploymentRecord = useApplicationStore((state) => state.addEmploymentRecord)
  const updateEmploymentRecord = useApplicationStore((state) => state.updateEmploymentRecord)
  const removeEmploymentRecord = useApplicationStore((state) => state.removeEmploymentRecord)
  
  // Store callbacks in refs to prevent re-renders when they change
  const updateEmploymentRecordRef = useRef(updateEmploymentRecord)
  const removeEmploymentRecordRef = useRef(removeEmploymentRecord)
  const activeClientIdRef = useRef(activeClientId)
  
  // Update refs without triggering re-renders - only update when values actually change
  if (updateEmploymentRecordRef.current !== updateEmploymentRecord) {
    updateEmploymentRecordRef.current = updateEmploymentRecord
  }
  if (removeEmploymentRecordRef.current !== removeEmploymentRecord) {
    removeEmploymentRecordRef.current = removeEmploymentRecord
  }
  if (activeClientIdRef.current !== activeClientId) {
    activeClientIdRef.current = activeClientId
  }
  
  return {
    activeClientId,
    addEmploymentRecord,
    updateEmploymentRecordRef,
    removeEmploymentRecordRef,
    activeClientIdRef
  }
}

/**
 * Hook to create stable callbacks for employment form interactions
 */
export function useEmploymentCallbacks(
  updateEmploymentRecordRef: React.MutableRefObject<(clientId: string, recordId: string, updates: Partial<EmploymentRecord>) => void>,
  removeEmploymentRecordRef: React.MutableRefObject<(clientId: string, recordId: string) => void>,
  activeClientIdRef: React.MutableRefObject<string>
) {
  const handleBlurSave = useCallback((recordId: string, field: keyof EmploymentFormData, value: EmploymentFormData[keyof EmploymentFormData]) => {
    updateEmploymentRecordRef.current(activeClientIdRef.current, recordId, { [field]: value })
  }, []) // Empty deps - use refs instead
  
  const handleDelete = useCallback((recordId: string) => {
    removeEmploymentRecordRef.current(activeClientIdRef.current, recordId)
  }, []) // Empty deps - use refs instead
  
  return { handleBlurSave, handleDelete }
}

/**
 * Hook to check if employment note should be shown (less than 2 years of history)
 */
export function useShouldShowEmploymentNote(employmentRecords: EmploymentRecord[]) {
  return useMemo(() => {
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
}

