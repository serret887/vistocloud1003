// Utility functions for income condition generation
import type { EmploymentRecord } from '$lib/types/employment';

export interface EmploymentGap {
  startDate: Date;
  endDate: Date;
  durationMonths: number;
}

export function getYearsWorkedForW2(startDate: string, endDate: string | null): number[] {
  const years: number[] = [];
  if (!startDate) return years;

  const start = new Date(startDate + 'T00:00:00');
  const end = endDate ? new Date(endDate + 'T00:00:00') : new Date();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    if (year === currentYear) {
      if (endDate && endYear === currentYear && currentMonth >= 11) {
        years.push(year);
      }
    } else {
      years.push(year);
    }
  }

  return years;
}

export function getYearsWorkedForTaxReturns(startDate: string, endDate: string | null): number[] {
  const years: number[] = [];
  if (!startDate) return years;

  const start = new Date(startDate + 'T00:00:00');
  const end = endDate ? new Date(endDate + 'T00:00:00') : new Date();
  const currentYear = new Date().getFullYear();
  
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    if (year < currentYear) {
      years.push(year);
    }
  }

  return years;
}

export function detectEmploymentGaps(employmentData: EmploymentRecord[]): EmploymentGap[] {
  if (employmentData.length <= 1) return [];

  const gaps: EmploymentGap[] = [];
  const sortedRecords = [...employmentData]
    .filter(emp => emp.startDate)
    .sort((a, b) => 
      new Date(a.startDate + 'T00:00:00').getTime() - new Date(b.startDate + 'T00:00:00').getTime()
    );

  for (let i = 0; i < sortedRecords.length - 1; i++) {
    const current = sortedRecords[i];
    const next = sortedRecords[i + 1];
    
    const currentEnd = current.endDate 
      ? new Date(current.endDate + 'T00:00:00')
      : new Date();
    const nextStart = new Date(next.startDate + 'T00:00:00');

    const gapDays = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24);
    
    if (gapDays > 30) {
      const gapMonths = Math.floor(gapDays / 30);
      gaps.push({
        startDate: currentEnd,
        endDate: nextStart,
        durationMonths: gapMonths
      });
    }
  }

  return gaps;
}

export function calculateTotalCoverage(employmentData: EmploymentRecord[]): number {
  let totalMonths = 0;
  const now = new Date();

  for (const emp of employmentData) {
    if (!emp.startDate) continue;

    const start = new Date(emp.startDate + 'T00:00:00');
    const end = emp.endDate 
      ? new Date(emp.endDate + 'T00:00:00')
      : now;

    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 
                     + (end.getMonth() - start.getMonth());
    
    totalMonths += monthsDiff;
  }

  return totalMonths;
}


