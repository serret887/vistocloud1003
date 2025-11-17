'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isAlphaName } from '@/lib/validators'

export default function NameField({ id, name, label, value, onChange, onBlur, required = true }: { id: string; name?: string; label: string; value?: string; onChange?: (v: string) => void; onBlur?: (v: string) => void; required?: boolean }) {
  const [val, setVal] = useState(value ?? '')
  const [touched, setTouched] = useState(false)
  const valid = !val ? !required : isAlphaName(val)
  
  // Sync internal state with external value prop
  useEffect(() => {
    setVal(value ?? '')
  }, [value])
  
  useEffect(() => { onChange?.(val) }, [val])
  
  const handleBlur = () => {
    setTouched(true)
    onBlur?.(val)
  }
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} required={required} value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} pattern="[A-Za-z'\-\s]+" className={!valid && touched ? 'border-red-500 focus-visible:ring-red-500' : ''} />
      {!valid && touched && <div role="alert" className="text-xs text-red-600">{label} must contain only letters</div>}
    </div>
  )
}
