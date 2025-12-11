// Asset condition utilities
export function getLastFourDigits(accountNumber: string | null | undefined): string {
  if (!accountNumber) return '';
  return accountNumber.length >= 4 ? accountNumber.slice(-4) : accountNumber;
}



