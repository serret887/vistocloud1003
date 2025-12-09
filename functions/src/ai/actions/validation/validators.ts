/**
 * Validation helper functions
 */

/**
 * Validate phone number format (10 digits US format)
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return true; // Optional field
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate SSN format (XXX-XX-XXXX)
 */
export function validateSSN(ssn: string): boolean {
  if (!ssn) return true; // Optional field
  const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
  return ssnRegex.test(ssn);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(date: string): boolean {
  if (!date) return true; // Optional field
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Validate date range (end date must be after start date)
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
}

