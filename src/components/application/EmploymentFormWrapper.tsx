/**
 * EmploymentFormWrapper is a memoized wrapper component that prevents unnecessary
 * re-renders of individual employment forms when other records change.
 */
'use client'

import { memo, useCallback, useRef } from 'react'
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
 * 
 * Note: We compare by reference first for performance, then by specific fields
 */
function arePropsEqual(
  prevProps: EmploymentFormWrapperProps,
  nextProps: EmploymentFormWrapperProps
): boolean {
  // Fast path: if record object reference is the same, props are equal (unless callbacks changed)
  if (prevProps.record === nextProps.record) {
    // Still need to check callbacks and autoFocus
    return (
      prevProps.onBlurSave === nextProps.onBlurSave &&
      prevProps.onDelete === nextProps.onDelete &&
      prevProps.autoFocus === nextProps.autoFocus
    )
  }
  
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

const EmploymentFormWrapperComponent = memo<EmploymentFormWrapperProps>(({ 
  record, 
  onBlurSave, 
  onDelete,
  autoFocus
}) => {
  // Use refs to store callbacks and record ID to avoid recreating callbacks on every render
  const onBlurSaveRef = useRef(onBlurSave)
  const onDeleteRef = useRef(onDelete)
  const recordIdRef = useRef(record.id)
  
  // Update refs when props change (this doesn't trigger re-renders)
  if (onBlurSaveRef.current !== onBlurSave) {
    onBlurSaveRef.current = onBlurSave
  }
  if (onDeleteRef.current !== onDelete) {
    onDeleteRef.current = onDelete
  }
  if (recordIdRef.current !== record.id) {
    recordIdRef.current = record.id
  }
  
  // Create stable callbacks that use refs - these never change
  const handleFieldBlur = useCallback((field: keyof EmploymentFormData, value: EmploymentFormData[keyof EmploymentFormData]) => {
    onBlurSaveRef.current(recordIdRef.current, field, value)
  }, []) // Empty deps - use refs instead

  const handleDelete = useCallback(() => {
    onDeleteRef.current(recordIdRef.current)
  }, []) // Empty deps - use refs instead

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

EmploymentFormWrapperComponent.displayName = 'EmploymentFormWrapper'

// Enable why-did-you-render tracking in development
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore - why-did-you-render property
  EmploymentFormWrapperComponent.whyDidYouRender = true
}

export const EmploymentFormWrapper = EmploymentFormWrapperComponent

