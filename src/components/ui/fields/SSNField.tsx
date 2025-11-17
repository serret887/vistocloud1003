'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

function digitsOnly(v: string) {
  return v.replace(/\D/g, '').slice(0, 9)
}

function format(digits: string) {
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0,3)}-${digits.slice(3)}`
  return `${digits.slice(0,3)}-${digits.slice(3,5)}-${digits.slice(5)}`
}

export default function SSNField({ id = 'ssn', label = 'SSN', value, onChange, onBlur, required = true, "data-testid": dataTestId }: { id?: string; label?: string; value?: string; onChange?: (v: string) => void; onBlur?: (v: string) => void; required?: boolean; "data-testid"?: string }) {
  const [rawSSN, setRawSSN] = useState(() => digitsOnly(value ?? ''))
  const [isRevealed, setIsRevealed] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    setRawSSN(digitsOnly(value ?? ''))
  }, [value])

  useEffect(() => {
    const formatted = format(rawSSN)
    if (formatted !== value) {
      onChange?.(formatted)
    }
  }, [rawSSN, value, onChange])

  function masked(digits: string) {
    if (digits.length < 4) return format(digits)
    return '***-**-' + digits.slice(-4)
  }

  function getDisplayValue() {
    return (isFocused || isRevealed) ? format(rawSSN) : masked(rawSSN)
  }

  const valid = rawSSN.length === 9 || !required

  const handleBlur = () => {
    setIsFocused(false)
    setIsRevealed(false)
    setTouched(true)
    onBlur?.(format(rawSSN))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input 
          id={id} 
          value={getDisplayValue()} 
          onChange={(e) => setRawSSN(digitsOnly(e.target.value))} 
          onFocus={() => setIsFocused(true)} 
          onBlur={handleBlur}
          maxLength={11} 
          className={!valid && touched ? 'border-red-500 focus-visible:ring-red-500' : ''} 
          data-testid={dataTestId}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-0 top-0 h-9 w-9" 
          onClick={() => setIsRevealed(!isRevealed)}
          type="button"
          aria-label={isRevealed ? 'Hide SSN' : 'Show SSN'}
        >
          {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {!valid && touched && <div role="alert" className="text-xs text-red-600">Enter a valid 9-digit SSN</div>}
    </div>
  )
}
