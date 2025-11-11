/**
 * Utility functions for formatting address objects consistently across the application
 */

export interface AddressObject {
  address1?: string
  address2?: string
  formattedAddress?: string
  city?: string
  region?: string
  postalCode?: string
  country?: string
  lat?: number
  lng?: number
}

/**
 * Formats an address object into a human-readable string
 * @param address - The address object to format
 * @param options - Formatting options
 * @returns Formatted address string
 */
export function formatAddress(
  address: AddressObject | null | undefined,
  options: {
    includeCountry?: boolean
    includePostalCode?: boolean
    fallbackText?: string
  } = {}
): string {
  const {
    includeCountry = false,
    includePostalCode = true,
    fallbackText = 'No address provided'
  } = options

  if (!address) {
    return fallbackText
  }

  // If we have a fully formatted address, use it
  if (address.formattedAddress) {
    return address.formattedAddress
  }

  // Build address parts
  const parts: string[] = []

  // Add street address
  if (address.address1) {
    parts.push(address.address1)
  }

  // Add address line 2 if present
  if (address.address2) {
    parts.push(address.address2)
  }

  // Add city
  if (address.city) {
    parts.push(address.city)
  }

  // Add region/state
  if (address.region) {
    parts.push(address.region)
  }

  // Add postal code
  if (includePostalCode && address.postalCode) {
    parts.push(address.postalCode)
  }

  // Add country
  if (includeCountry && address.country) {
    parts.push(address.country)
  }

  // Return formatted address or fallback
  return parts.length > 0 ? parts.join(', ') : fallbackText
}

/**
 * Formats an address for display in forms (shorter format)
 * @param address - The address object to format
 * @returns Short formatted address string
 */
export function formatAddressShort(address: AddressObject | null | undefined): string {
  return formatAddress(address, {
    includeCountry: false,
    includePostalCode: false,
    fallbackText: 'No address'
  })
}

/**
 * Formats an address for display in lists/cards (medium format)
 * @param address - The address object to format
 * @returns Medium formatted address string
 */
export function formatAddressMedium(address: AddressObject | null | undefined): string {
  return formatAddress(address, {
    includeCountry: false,
    includePostalCode: true,
    fallbackText: 'No address provided'
  })
}

/**
 * Formats an address for display in detailed views (full format)
 * @param address - The address object to format
 * @returns Full formatted address string
 */
export function formatAddressFull(address: AddressObject | null | undefined): string {
  return formatAddress(address, {
    includeCountry: true,
    includePostalCode: true,
    fallbackText: 'No address provided'
  })
}

/**
 * Checks if an address object has meaningful content
 * @param address - The address object to check
 * @returns True if address has content, false otherwise
 */
export function hasAddressContent(address: AddressObject | null | undefined): boolean {
  if (!address) return false
  
  return !!(
    address.formattedAddress ||
    address.address1 ||
    address.city ||
    address.region ||
    address.postalCode ||
    address.country
  )
}

/**
 * Extracts a display-friendly value from any object, with special handling for addresses
 * @param value - The value to format
 * @returns Formatted string representation
 */
export function formatValueForDisplay(value: any): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  if (value === null || value === undefined) return ''
  
  // Handle address objects
  if (typeof value === 'object' && value !== null) {
    // Check if it looks like an address object
    if (hasAddressContent(value)) {
      return formatAddressMedium(value)
    }
    // For other objects, return a generic message
    return '[Complex data]'
  }
  
  return String(value)
}
