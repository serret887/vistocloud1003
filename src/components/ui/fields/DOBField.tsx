'use client'

import DateField from './DateField'

function isAdult(dateStr: string): boolean {
  const birthDate = new Date(dateStr)
  if (isNaN(birthDate.getTime())) return false
  
  const today = new Date()
  if (birthDate > today) return false
  
  // Calculate age more accurately
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age >= 18
}

export default function DOBField({ 
  id = 'dob', 
  label = 'Date of birth', 
  value, 
  onChange, 
  onBlur, 
  required = true 
}: { 
  id?: string
  label?: string
  value?: string
  onChange?: (v: string) => void
  onBlur?: (v: string) => void
  required?: boolean 
}) {
  // Calculate the maximum date (18 years ago from today)
  const today = new Date()
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <DateField
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      maxDate={maxDateStr}
      customValidation={isAdult}
      errorMessage="Must be at least 18 years old"
    />
  )
}
