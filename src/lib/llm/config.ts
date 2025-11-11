import type { LLMConfig } from './types'

/**
 * Default LLM configuration
 */
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 4000
}

/**
 * Get current date information for LLM context
 */
export function getCurrentDateContext() {
  const today = new Date()
  const todayFormatted = today.toISOString().split('T')[0] // YYYY-MM-DD
  const todayReadable = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  return {
    today,
    todayFormatted,
    todayReadable
  }
}

/**
 * Calculate relative dates based on current date
 */
export function calculateRelativeDate(relativeTerm: string, currentDate: Date): string {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const day = currentDate.getDate()
  
  switch (relativeTerm.toLowerCase()) {
    case 'two years ago':
    case 'for the last two years':
      // Handle leap year edge case: if current date is Feb 29 and target year is not leap year, use Feb 28
      const targetYear = year - 2
      const isLeapYear = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0)
      const targetDay = (month === 1 && day === 29 && !isLeapYear) ? 28 : day
      return new Date(targetYear, month, targetDay).toISOString().split('T')[0]
    case 'one year ago':
    case 'for the last year':
      const targetYear1 = year - 1
      const isLeapYear1 = (targetYear1 % 4 === 0 && targetYear1 % 100 !== 0) || (targetYear1 % 400 === 0)
      const targetDay1 = (month === 1 && day === 29 && !isLeapYear1) ? 28 : day
      return new Date(targetYear1, month, targetDay1).toISOString().split('T')[0]
    case 'six months ago':
    case 'for the past 6 months':
      return new Date(year, month - 6, day).toISOString().split('T')[0]
    default:
      // Handle decimal numbers first (most specific)
      const decimalMatch = relativeTerm.match(/(\d+\.\d+)\s*(year|month|day)s?\s*ago/i)
      if (decimalMatch) {
        const num = Math.floor(parseFloat(decimalMatch[1]))
        const unit = decimalMatch[2].toLowerCase()
        
        if (unit === 'year') {
          const targetYear = year - num
          const isLeapYear = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0)
          const targetDay = (month === 1 && day === 29 && !isLeapYear) ? 28 : day
          return new Date(targetYear, month, targetDay).toISOString().split('T')[0]
        } else if (unit === 'month') {
          return new Date(year, month - num, day).toISOString().split('T')[0]
        }
      }
      
      // Handle negative numbers (future dates)
      const negativeMatch = relativeTerm.match(/(-?\d+)\s*(year|month|day)s?\s*ago/i)
      if (negativeMatch) {
        const num = parseInt(negativeMatch[1])
        const unit = negativeMatch[2].toLowerCase()
        
        if (unit === 'year') {
          const targetYear = year - num // -1 years ago = year - (-1) = year + 1
          const isLeapYear = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0)
          const targetDay = (month === 1 && day === 29 && !isLeapYear) ? 28 : day
          return new Date(targetYear, month, targetDay).toISOString().split('T')[0]
        } else if (unit === 'month') {
          return new Date(year, month - num, day).toISOString().split('T')[0]
        }
      }
      
      // Try to extract number and unit (positive numbers only)
      const match = relativeTerm.match(/(\d+)\s*(year|month|day)s?\s*ago/i)
      if (match) {
        const num = parseInt(match[1])
        const unit = match[2].toLowerCase()
        
        if (unit === 'year') {
          const targetYear = year - num
          const isLeapYear = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0)
          const targetDay = (month === 1 && day === 29 && !isLeapYear) ? 28 : day
          return new Date(targetYear, month, targetDay).toISOString().split('T')[0]
        } else if (unit === 'month') {
          return new Date(year, month - num, day).toISOString().split('T')[0]
        }
      }
      
      return ''
  }
}
