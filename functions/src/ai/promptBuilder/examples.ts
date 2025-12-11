/**
 * Few-shot examples for system prompt
 */

export function getExamples(todayFormatted: string): string {
  const twoYearsAgo = new Date(new Date().getFullYear() - 2, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0];
  
  return `Few-Shot Examples:
Example 1: Input: "Maria has 2 jobs, maid and self-employed cleaner. Makes 2000 and 4000."
Reasoning: Step 1: Identify client Maria (create if new). Step 2: Two jobs mentioned—create two employment records. Step 3: Assign incomes by order: 2000 to maid, 4000 to cleaner. Step 4: Period not specified—ask in nextSteps.
Output: {"actions": [addEmploymentRecord for Maria (maid, W2), update with details, addActiveIncome linked with 2000 (assume monthly, but ask), similarly for cleaner (selfEmployed)], "nextSteps": "Is the 2000 and 4000 per month or year?"}

Example 2: Input: "Carlos has one job at TechCorp, update Maria's maid job to 2500."
Reasoning: Step 1: Carlos new? Create with name. Maria exists. Step 2: Add employment for Carlos. Step 3: Find Maria's maid record and update income. Step 4: Check missing: Carlos needs more details.
Output: {"actions": [addClient for Carlos with firstName: "Carlos", addEmploymentRecord for Carlos at TechCorp, update Maria's existing maid income to 2500], "nextSteps": "For Carlos: job title, income, dates? For Maria: anything else?"}

Example 3: Input: "Kelly's phone is 1-2-3-4-6-7-8-1-8-1"
Reasoning: Step 1: Kelly exists? Create if new. Step 2: Parse phone "1-2-3-4-6-7-8-1-8-1" → remove non-digits → "12345678181" (11 digits) → drop leading 1 → "2345678181" (10 digits). Step 3: Update Kelly's phone.
Output: {"actions": [updateClientData for Kelly with phone: "2345678181"], "nextSteps": "Any other information for Kelly?"}

Example 4: Input: "Hey I'm doing an application for Kelly Parrish. She lives in 4027 Pierce Street, Hollywood, Florida. She's been living there for the last two years. On top of that, she works for Sands Investments and she's been working there for the last two years. She's self-employed and she makes around $4,000 every month for this company. Kelly is a citizen. Her phone number is 1-2-3-4-6-7-8-1-8-1. Her social security is 683-361-781"
Reasoning: Step 1: Kelly Parrish is new client - create with all provided info. Step 2: Parse phone "1-2-3-4-6-7-8-1-8-1" → "2345678181". Step 3: Create employment record for Sands Investments (self-employed). Step 4: Create income record linked to employment. Step 5: Create address record for residence.
Output: {"actions": [addClient with firstName: "Kelly", lastName: "Parrish", phone: "2345678181", ssn: "683-361-781", citizenship: "US Citizen", addEmploymentRecord, updateEmploymentRecord with employerName: "Sands Investments", selfEmployed: true, startDate: "${twoYearsAgo}", addActiveIncome, updateActiveIncome with monthlyAmount: 4000, updateAddressData with address1: "4027 Pierce Street", city: "Hollywood", fromDate: "${twoYearsAgo}"], "nextSteps": "Any additional information for Kelly's application?"}`;
}


