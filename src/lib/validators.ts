export function isAlphaName(value: string): boolean {
  if (!value) return false
  // Allow letters, spaces, hyphens, and apostrophes; reject digits and symbols
  return /^[A-Za-z'\-\s]+$/.test(value.trim())
}

export function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function validatePhoneLoose(value: string): boolean {
  // Accept digits, spaces, parentheses, plus, hyphen; must contain at least 7 digits
  const digits = (value || '').replace(/\D/g, '')
  return digits.length >= 7
}

export function validateUSPhone(value: string): boolean {
  // US phone numbers should have 9, 10, or 11 digits
  // 9 digits: might be missing leading digit (e.g., 234678181 -> 1234678181)
  // 10 digits: standard US phone number
  // 11 digits: with country code (1)
  const digits = (value || '').replace(/\D/g, '')
  return digits.length >= 9 && digits.length <= 11
}

export function formatUSPhone(value: string): string {
  // Format as (XXX) XXX-XXXX
  let digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  
  // If 9 digits, assume missing leading digit and add '1'
  if (digits.length === 9) {
    digits = '1' + digits
  }
  
  // Remove leading '1' if 11 digits for formatting
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1)
  }
  
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}
