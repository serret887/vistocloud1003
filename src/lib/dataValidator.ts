/**
 * Centralized Data Validation and Formatting Service
 * All data must pass through this validator before entering the application store
 */

import { validateUSPhone, formatUSPhone, validateEmail } from '@/lib/validators'
import type { ClientData } from '@/types/client-data'
import type { EmploymentRecord } from '@/types/employment'

export interface ValidationResult<T> {
  isValid: boolean
  data: T
  errors: string[]
  warnings: string[]
}

export interface ValidatedClientData extends Partial<ClientData> {
  phone?: string
  email?: string
}

export interface ValidatedEmploymentRecord extends Partial<EmploymentRecord> {
  phoneNumber?: string
}

/**
 * Validates and formats client data before storing
 */
export function validateClientData(data: Partial<ClientData>): ValidationResult<ValidatedClientData> {
  const errors: string[] = []
  const warnings: string[] = []
  const validatedData: ValidatedClientData = { ...data }

  // Validate and format phone number
  if (data.phone) {
    if (validateUSPhone(data.phone)) {
      validatedData.phone = formatUSPhone(data.phone)
      console.log('✅ Validated client phone:', data.phone, '→', validatedData.phone)
    } else {
      errors.push(`Invalid phone number format: ${data.phone}`)
      console.warn('❌ Invalid client phone number:', data.phone)
      delete validatedData.phone
    }
  }

  // Validate email
  if (data.email) {
    if (validateEmail(data.email)) {
      validatedData.email = data.email.toLowerCase().trim()
      console.log('✅ Validated client email:', data.email, '→', validatedData.email)
    } else {
      errors.push(`Invalid email format: ${data.email}`)
      console.warn('❌ Invalid client email:', data.email)
      delete validatedData.email
    }
  }

  // Validate SSN format (XXX-XX-XXXX)
  if (data.ssn) {
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/
    if (ssnRegex.test(data.ssn)) {
      // Format SSN consistently
      const digits = data.ssn.replace(/\D/g, '')
      if (digits.length === 9) {
        const areaNumber = digits.slice(0, 3)
        const groupNumber = digits.slice(3, 5)
        const serialNumber = digits.slice(5)
        
        // Check for invalid SSN patterns
        const invalidAreaNumbers = ['000', '666']
        const invalidGroupNumbers = ['00']
        const invalidSerialNumbers = ['0000']
        
        if (invalidAreaNumbers.includes(areaNumber) || 
            areaNumber.startsWith('9') || // 900-999 series
            invalidGroupNumbers.includes(groupNumber) || 
            invalidSerialNumbers.includes(serialNumber)) {
          errors.push(`Invalid SSN: ${data.ssn} contains unassigned number patterns`)
          console.warn('❌ Invalid client SSN pattern:', data.ssn)
          delete validatedData.ssn
        } else {
          validatedData.ssn = `${areaNumber}-${groupNumber}-${serialNumber}`
          console.log('✅ Validated client SSN:', data.ssn, '→', validatedData.ssn)
        }
      } else {
        errors.push(`Invalid SSN: must be 9 digits`)
        console.warn('❌ Invalid client SSN length:', data.ssn)
        delete validatedData.ssn
      }
    } else {
      errors.push(`Invalid SSN format: ${data.ssn}`)
      console.warn('❌ Invalid client SSN format:', data.ssn)
      delete validatedData.ssn
    }
  }

  // Validate names (basic validation)
  if (data.firstName && typeof data.firstName === 'string') {
    const cleanName = data.firstName.trim()
    if (cleanName.length > 0) {
      validatedData.firstName = cleanName
    } else {
      warnings.push('Empty first name provided')
    }
  }

  if (data.lastName && typeof data.lastName === 'string') {
    const cleanName = data.lastName.trim()
    if (cleanName.length > 0) {
      validatedData.lastName = cleanName
    } else {
      warnings.push('Empty last name provided')
    }
  }

  return {
    isValid: errors.length === 0,
    data: validatedData,
    errors,
    warnings
  }
}

/**
 * Validates and formats employment record data before storing
 */
export function validateEmploymentRecord(data: Partial<EmploymentRecord>): ValidationResult<ValidatedEmploymentRecord> {
  const errors: string[] = []
  const warnings: string[] = []
  const validatedData: ValidatedEmploymentRecord = { ...data }

  // Validate and format phone number
  if (data.phoneNumber) {
    if (validateUSPhone(data.phoneNumber)) {
      validatedData.phoneNumber = formatUSPhone(data.phoneNumber)
      console.log('✅ Validated employment phone:', data.phoneNumber, '→', validatedData.phoneNumber)
    } else {
      errors.push(`Invalid employment phone number format: ${data.phoneNumber}`)
      console.warn('❌ Invalid employment phone number:', data.phoneNumber)
      delete validatedData.phoneNumber
    }
  }

  // Validate employer name
  if (data.employerName && typeof data.employerName === 'string') {
    const cleanName = data.employerName.trim()
    if (cleanName.length > 0) {
      validatedData.employerName = cleanName
    } else {
      warnings.push('Empty employer name provided')
    }
  }

  // Validate job title
  if (data.jobTitle && typeof data.jobTitle === 'string') {
    const cleanTitle = data.jobTitle.trim()
    if (cleanTitle.length > 0) {
      validatedData.jobTitle = cleanTitle
    } else {
      warnings.push('Empty job title provided')
    }
  }

  // Note: Income validation is handled in the income records, not employment records

  return {
    isValid: errors.length === 0,
    data: validatedData,
    errors,
    warnings
  }
}

/**
 * Validates and formats any phone number
 */
export function validatePhoneNumber(phone: string, context: string = 'phone'): ValidationResult<string> {
  const errors: string[] = []
  const warnings: string[] = []

  if (validateUSPhone(phone)) {
    const formattedPhone = formatUSPhone(phone)
    console.log(`✅ Validated ${context}:`, phone, '→', formattedPhone)
    return {
      isValid: true,
      data: formattedPhone,
      errors: [],
      warnings: []
    }
  } else {
    errors.push(`Invalid ${context} number format: ${phone}`)
    console.warn(`❌ Invalid ${context} number:`, phone)
    return {
      isValid: false,
      data: '',
      errors,
      warnings
    }
  }
}

/**
 * Validates and formats email address
 */
export function validateEmailAddress(email: string): ValidationResult<string> {
  const errors: string[] = []
  const warnings: string[] = []

  if (validateEmail(email)) {
    const formattedEmail = email.toLowerCase().trim()
    console.log('✅ Validated email:', email, '→', formattedEmail)
    return {
      isValid: true,
      data: formattedEmail,
      errors: [],
      warnings: []
    }
  } else {
    errors.push(`Invalid email format: ${email}`)
    console.warn('❌ Invalid email:', email)
    return {
      isValid: false,
      data: '',
      errors,
      warnings
    }
  }
}

/**
 * Logs validation results for debugging
 */
export function logValidationResults<T>(
  context: string, 
  result: ValidationResult<T>
): void {
  if (result.errors.length > 0) {
    console.error(`❌ ${context} validation failed:`, result.errors)
  }
  if (result.warnings.length > 0) {
    console.warn(`⚠️ ${context} validation warnings:`, result.warnings)
  }
  if (result.isValid && result.errors.length === 0) {
    console.log(`✅ ${context} validation passed`)
  }
}
