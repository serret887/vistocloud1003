/**
 * EmploymentFormWrapper is a memoized wrapper component that prevents unnecessary
 * re-renders of individual employment forms when other records change.
 */
'use client'

import { memo, useCallback } from 'react'
import { EmploymentForm } from './EmploymentForm'
import type { EmploymentRecord, EmploymentFormData } from '@/types/employment'

interface EmploymentFormWrapperProps {
  record: EmploymentRecord
  onBlurSave: (recordId: string, field: keyof EmploymentFormData, value: EmploymentFormData[keyof EmploymentFormData]) => void
  onDelete: (recordId: string) => void
  autoFocus?: boolean
}

/**
 * Custom comparison function for React.memo
 * Only re-renders if record data actually changed or callbacks changed
 */
function arePropsEqual(
  prevProps: EmploymentFormWrapperProps,
  nextProps: EmploymentFormWrapperProps
): boolean {
  // Re-render if record ID changed (different record)
  if (prevProps.record.id !== nextProps.record.id) return false
  
  // Re-render if record was updated (updatedAt changes when record is modified)
  if (prevProps.record.updatedAt !== nextProps.record.updatedAt) return false
  
  // Re-render if callbacks changed
  if (prevProps.onBlurSave !== nextProps.onBlurSave) return false
  if (prevProps.onDelete !== nextProps.onDelete) return false
  
  // Re-render if autoFocus changed
  if (prevProps.autoFocus !== nextProps.autoFocus) return false
  
  // If all the above are the same, skip re-render (return true means props are equal)
  return true
}

export const EmploymentFormWrapper = memo<EmploymentFormWrapperProps>(({ 
  record, 
  onBlurSave, 
  onDelete,
  autoFocus
}) => {
  const handleFieldBlur = useCallback((field: keyof EmploymentFormData, value: EmploymentFormData[keyof EmploymentFormData]) => {
    onBlurSave(record.id, field, value)
  }, [record.id, onBlurSave])

  const handleDelete = useCallback(() => {
    onDelete(record.id)
  }, [record.id, onDelete])
console.log("EmploymentFormWrapper is being rendered")
  return (
    <EmploymentForm
      record={record}
      isLoading={false}
      onFieldBlur={handleFieldBlur}
      onDelete={handleDelete}
      autoFocus={autoFocus}
    />
  )
}, arePropsEqual)

EmploymentFormWrapper.displayName = 'EmploymentFormWrapper'

