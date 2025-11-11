export interface AddressForMonths {
  yearsAtThisAddress?: number
  monthsAtThisAddress?: number
  type?: 'present' | 'former' | 'mailing'
}

export function totalResidenceMonths(addresses: AddressForMonths[]): number {
  if (!Array.isArray(addresses)) return 0
  return addresses.reduce((sum, a) => {
    const years = Math.max(0, a.yearsAtThisAddress ?? 0)
    const months = Math.max(0, a.monthsAtThisAddress ?? 0)
    return sum + years * 12 + months
  }, 0)
}

export function formatSsn(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '').slice(0, 9)
  if (digits.length !== 9) return raw
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

export function maskSsn(raw: string): string {
  const formatted = formatSsn(raw)
  if (!/^\d{3}-\d{2}-\d{4}$/.test(formatted)) return raw
  return `***-**-${formatted.slice(-4)}`
}
