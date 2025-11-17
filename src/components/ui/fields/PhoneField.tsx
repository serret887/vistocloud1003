'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateUSPhone, formatUSPhone } from '@/lib/validators'

export default function PhoneField({ id = 'phone', label = 'Phone', value, onChange, onBlur, required = true }: { id?: string; label?: string; value?: string; onChange?: (v: string) => void; onBlur?: (v: string) => void; required?: boolean }) {
  const [val, setVal] = useState(value ?? '')
  const [touched, setTouched] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const valid = !val ? !required : validateUSPhone(val)
  
  // Sync internal state with external value prop, but only when not focused
  useEffect(() => {
    if (!isFocused) {
      setVal(value ?? '')
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Only allow digits, spaces, parentheses, and hyphens
    const cleanedValue = inputValue.replace(/[^\d\s\(\)\-]/g, '')
    
    // Limit to 14 characters (formatted US phone: (XXX) XXX-XXXX)
    if (cleanedValue.length <= 14) {
      const formatted = formatUSPhone(cleanedValue)
      setVal(formatted)
      onChange?.(formatted)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    setTouched(true)
    onBlur?.(val)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input 
        id={id} 
        type="tel" 
        value={val} 
        onChange={handleChange} 
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="(555) 123-4567"
        maxLength={14}
        className={!valid && touched ? 'border-red-500 focus-visible:ring-red-500' : ''} 
      />
      {!valid && touched && (
        <div role="alert" className="text-xs text-red-600">
          {val.length === 0 ? 'Phone number is required' : 'Enter a valid 10-digit US phone number'}
        </div>
      )}
    </div>
  )
}
