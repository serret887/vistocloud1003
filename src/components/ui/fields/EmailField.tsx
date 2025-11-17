import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateEmail } from '@/lib/validators'

export default function EmailField({ id = 'email', label = 'Email', value, onChange, onBlur, required = true }: { id?: string; label?: string; value?: string; onChange?: (v: string) => void; onBlur?: (v: string) => void; required?: boolean }) {
  const [val, setVal] = useState(value ?? '')
  const [touched, setTouched] = useState(false)
  const valid = !val ? !required : validateEmail(val)
  
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
      <Input id={id} type="email" value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} className={!valid && touched ? 'border-red-500 focus-visible:ring-red-500' : ''} />
      {!valid && touched && <div role="alert" className="text-xs text-red-600">Enter a valid email</div>}
    </div>
  )
}
