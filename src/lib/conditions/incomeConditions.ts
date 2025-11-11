import type { AddConditionFn, ConditionGeneratorInput } from './types';
import type { EmploymentRecord } from '@/types/employment';

/**
 * Generate income-related conditions (W-2s, Pay Stubs, Tax Returns, etc.)
 */
export function generateIncomeConditions(
  input: ConditionGeneratorInput,
  addCondition: AddConditionFn
): void {
  const { employmentData, client } = input;

  if (!employmentData || employmentData.length === 0) {
    return;
  }

  // Check for employment gaps and insufficient coverage
  const gaps = detectEmploymentGaps(employmentData);
  const totalMonths = calculateTotalCoverage(employmentData);
  const clientName = `${client.firstName} ${client.lastName}`.trim() || 'Client';

  // Generate condition for employment gaps
  if (gaps.length > 0) {
    generateEmploymentGapCondition(gaps, clientName, addCondition);
  }

  // Generate condition for insufficient employment history (less than 2 years)
  if (totalMonths < 24) {
    generateInsufficientEmploymentCondition(totalMonths, clientName, addCondition);
  }

  // Generate document conditions for each employment record
  employmentData.forEach((emp: EmploymentRecord) => {
    const employerName = emp.employerName || 'Employer';

    // Offer Letter condition (if applicable)
    if (emp.hasOfferLetter) {
      generateOfferLetterCondition(employerName, clientName, addCondition);
    }

    if (emp.selfEmployed === false) {
      // W-2 Employee
      generateW2Conditions(emp, employerName, addCondition);
      generatePaystubConditions(emp, employerName, addCondition);
      
      // If ownership > 25%, also need business tax returns (underwriting requirement)
      if (emp.ownershipPercentage) {
        generateBusinessTaxReturnsForOwnership(emp, employerName, addCondition);
      }
    } else if (emp.selfEmployed === true) {
      // Self-Employed
      generateSelfEmployedTaxConditions(emp, employerName, addCondition);
    }
  });
}

/**
 * Generate W-2 form conditions for W-2 employees
 * Underwriting requirement: Only need last 2 years of W-2s for income verification
 */
function generateW2Conditions(
  emp: EmploymentRecord,
  employerName: string,
  addCondition: AddConditionFn
): void {
  const yearsWorked = getYearsWorkedForW2(emp.startDate, emp.endDate);

  // Only request last 2 years (underwriting standard)
  const lastTwoYears = yearsWorked.slice(-2);

  if (lastTwoYears.length > 0) {
    const yearsList = lastTwoYears.join(', ');
    const yearsText = lastTwoYears.length === 1 ? 'year' : 'years';

    addCondition(
      'Income',
      `W-2 Forms from ${employerName} (${yearsList})`,
      `Please provide W-2 forms from ${employerName} for ${yearsText}: ${yearsList}`,
      'high',
      14
    );
  }
}

/**
 * Generate pay stub conditions for currently employed W-2 employees
 */
function generatePaystubConditions(
  emp: EmploymentRecord,
  employerName: string,
  addCondition: AddConditionFn
): void {
  const isCurrentlyEmployed = !emp.endDate || emp.currentlyEmployed;

  if (isCurrentlyEmployed) {
    addCondition(
      'Income',
      `Pay Stubs from ${employerName}`,
      `Please provide your most recent 30 days of pay stubs from ${employerName}`,
      'high',
      7
    );
  }
}

/**
 * Generate tax return conditions for self-employed individuals
 */
function generateSelfEmployedTaxConditions(
  emp: EmploymentRecord,
  employerName: string,
  addCondition: AddConditionFn
): void {
  const yearsWorked = getYearsWorkedForTaxReturns(emp.startDate, emp.endDate);

  // Only request last 2 years
  const lastTwoYears = yearsWorked.slice(-2);

  if (lastTwoYears.length > 0) {
    const yearsList = lastTwoYears.join(', ');
    const yearsText = lastTwoYears.length === 1 ? 'year' : 'years';

    // Personal Tax Returns
    addCondition(
      'Income',
      `Personal Tax Returns (${yearsList})`,
      `Please provide personal tax returns (Form 1040 with all schedules) for ${yearsText}: ${yearsList}`,
      'high',
      14
    );

    // Business Tax Returns
    addCondition(
      'Income',
      `Business Tax Returns for ${employerName} (${yearsList})`,
      `Please provide business tax returns for ${employerName} for ${yearsText}: ${yearsList}`,
      'high',
      14
    );
  }
}

/**
 * Calculate which years W-2 forms should be requested
 * Logic: Request W-2s for all past complete years, but NOT for the current year if still employed
 */
function getYearsWorkedForW2(startDate: string, endDate: string | null): number[] {
  const years: number[] = [];
  
  if (!startDate) {
    return years;
  }

  // Parse dates as YYYY-MM-DD local dates to avoid timezone issues
  const start = new Date(startDate + 'T00:00:00');
  const end = endDate ? new Date(endDate + 'T00:00:00') : new Date();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  // Add all years from start to end
  for (let year = startYear; year <= endYear; year++) {
    // For current year
    if (year === currentYear) {
      // If job ended this year, we might be able to get W-2 (if it's December or later)
      if (endDate && endYear === currentYear) {
        // Job ended this year - only include if we're in December or later
        if (currentMonth >= 11) { // December = 11
          years.push(year);
        }
      }
      // If still employed (no endDate), don't include current year
      // W-2s aren't available yet
    } else {
      // Past years - always include
      years.push(year);
    }
  }

  return years;
}

/**
 * Calculate which years tax returns should be requested
 * Logic: Similar to W-2 but we always ask for complete past years
 */
function getYearsWorkedForTaxReturns(startDate: string, endDate: string | null): number[] {
  const years: number[] = [];
  
  if (!startDate) {
    return years;
  }

  // Parse dates as YYYY-MM-DD local dates to avoid timezone issues
  const start = new Date(startDate + 'T00:00:00');
  const end = endDate ? new Date(endDate + 'T00:00:00') : new Date();
  const currentYear = new Date().getFullYear();
  
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  // Add all years from start to end, excluding current year
  for (let year = startYear; year <= endYear; year++) {
    // Don't include current year (tax returns not filed yet)
    if (year < currentYear) {
      years.push(year);
    }
  }

  return years;
}

/**
 * Employment gap interface
 */
interface EmploymentGap {
  startDate: Date;
  endDate: Date;
  durationMonths: number;
}

/**
 * Detect gaps in employment history
 */
function detectEmploymentGaps(employmentData: EmploymentRecord[]): EmploymentGap[] {
  if (employmentData.length <= 1) return [];

  const gaps: EmploymentGap[] = [];
  
  // Sort records by start date
  const sortedRecords = [...employmentData]
    .filter(emp => emp.startDate) // Only include records with start dates
    .sort((a, b) => 
      new Date(a.startDate + 'T00:00:00').getTime() - new Date(b.startDate + 'T00:00:00').getTime()
    );

  // Check for gaps between consecutive employment periods
  for (let i = 0; i < sortedRecords.length - 1; i++) {
    const current = sortedRecords[i];
    const next = sortedRecords[i + 1];
    
    // Parse dates as local dates
    const currentEnd = current.endDate 
      ? new Date(current.endDate + 'T00:00:00')
      : new Date(); // If no end date, still employed
    const nextStart = new Date(next.startDate + 'T00:00:00');

    // Calculate gap in days
    const gapDays = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24);
    
    // Consider gaps of more than 30 days (1 month) as significant
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

/**
 * Calculate total employment coverage in months
 */
function calculateTotalCoverage(employmentData: EmploymentRecord[]): number {
  let totalMonths = 0;
  const now = new Date();

  for (const emp of employmentData) {
    if (!emp.startDate) continue;

    const start = new Date(emp.startDate + 'T00:00:00');
    const end = emp.endDate 
      ? new Date(emp.endDate + 'T00:00:00')
      : now; // If no end date, use current date

    // Calculate months between dates
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 
                     + (end.getMonth() - start.getMonth());
    
    totalMonths += monthsDiff;
  }

  return totalMonths;
}

/**
 * Generate condition for employment gaps
 */
function generateEmploymentGapCondition(
  gaps: EmploymentGap[],
  clientName: string,
  addCondition: AddConditionFn
): void {
  const gapCount = gaps.length;
  const gapText = gapCount === 1 ? 'gap' : 'gaps';
  
  // Format gap periods
  const gapPeriods = gaps.map(gap => {
    const startStr = gap.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const endStr = gap.endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr} (${gap.durationMonths} month${gap.durationMonths !== 1 ? 's' : ''})`;
  }).join(', ');

  addCondition(
    'Income',
    `Employment Gap Explanation for ${clientName}`,
    `We detected ${gapCount} employment ${gapText} in the work history: ${gapPeriods}. Please provide a written explanation for these gaps, including what ${clientName} was doing during this time (e.g., education, travel, family care, job search, etc.)`,
    'high',
    14
  );
}

/**
 * Generate condition for insufficient employment history
 */
function generateInsufficientEmploymentCondition(
  totalMonths: number,
  clientName: string,
  addCondition: AddConditionFn
): void {
  const yearsProvided = (totalMonths / 12).toFixed(1);
  const monthsNeeded = 24 - totalMonths;

  addCondition(
    'Income',
    `Insufficient Employment History for ${clientName}`,
    `We require at least 2 years (24 months) of employment history. Currently provided: ${yearsProvided} years (${totalMonths} months). Please provide ${monthsNeeded} additional month${monthsNeeded !== 1 ? 's' : ''} of employment history, or provide a written explanation if less than 2 years of employment history is available (e.g., recent graduate, career change, etc.)`,
    'high',
    14
  );
}

/**
 * Generate offer letter condition for future employment
 */
function generateOfferLetterCondition(
  employerName: string,
  clientName: string,
  addCondition: AddConditionFn
): void {
  addCondition(
    'Income',
    `Offer Letter from ${employerName}`,
    `Please provide the signed offer letter from ${employerName} for ${clientName}, including details of compensation, start date, and employment terms`,
    'high',
    7
  );
}

/**
 * Generate business tax returns condition for W-2 employees with >25% ownership
 * Underwriting requirement: Significant ownership stake requires business documentation
 */
function generateBusinessTaxReturnsForOwnership(
  emp: EmploymentRecord,
  employerName: string,
  addCondition: AddConditionFn
): void {
  const yearsWorked = getYearsWorkedForTaxReturns(emp.startDate, emp.endDate);
  
  // Only request last 2 years
  const lastTwoYears = yearsWorked.slice(-2);

  if (lastTwoYears.length > 0) {
    const yearsList = lastTwoYears.join(', ');
    const yearsText = lastTwoYears.length === 1 ? 'year' : 'years';

    addCondition(
      'Income',
      `Business Tax Returns for ${employerName} (>25% Ownership) (${yearsList})`,
      `Since ownership percentage exceeds 25% in ${employerName}, please provide business tax returns (including K-1s if applicable) for ${yearsText}: ${yearsList}`,
      'high',
      14
    );
  }
}

