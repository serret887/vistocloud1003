'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateFieldProps {
  id?: string
  label?: string
  value?: string
  onChange?: (v: string) => void
  onBlur?: (v: string) => void
  required?: boolean
  minDate?: string
  maxDate?: string
  errorMessage?: string
  placeholder?: string
  className?: string
  customValidation?: (value: string) => boolean
}

export default function DateField({ 
  id = 'date', 
  label, 
  value, 
  onChange, 
  onBlur, 
  required = false,
  minDate,
  maxDate,
  errorMessage,
  placeholder,
  className = '',
  customValidation
}: DateFieldProps) {
  const [val, setVal] = useState(value ?? '')
  const [touched, setTouched] = useState(false)
  
  // Calculate validation
  const isValid = () => {
    if (!val) return !required
    
    // Validate min/max dates
    if (minDate && val < minDate) return false
    if (maxDate && val > maxDate) return false
    
    // Custom validation
    if (customValidation) return customValidation(val)
    
    return true
  }
  
  const valid = isValid()
  const prevValueRef = useRef(value)
  
  // Sync internal state with external value prop
  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value
      setVal(value ?? '')
    }
  }, [value])
  
  useEffect(() => { 
    if (onChange) {
      onChange(val)
    }
  }, [val, onChange])
  
  const handleBlur = () => {
    setTouched(true)
    onBlur?.(val)
  }
  
  const getErrorMessage = () => {
    if (errorMessage) return errorMessage
    if (required && !val) return 'This field is required'
    if (maxDate && val > maxDate) return 'Date cannot be in the future'
    if (minDate && val < minDate) return 'Date is too far in the past'
    return 'Invalid date'
  }
  
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input 
        id={id} 
        type="date" 
        value={val} 
        min={minDate}
        max={maxDate}
        placeholder={placeholder}
        onChange={e => setVal(e.target.value)} 
        onBlur={handleBlur}
        className={`w-full text-base px-4 py-2 ${className} ${!valid && touched ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
      />
      {!valid && touched && (
        <div role="alert" className="text-xs text-red-600">{getErrorMessage()}</div>
      )}
    </div>
  )
}

