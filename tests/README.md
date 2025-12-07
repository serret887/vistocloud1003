# E2E Test Suite

This directory contains comprehensive end-to-end tests for the VistoCloud application using Playwright.

## Test Files

### `happy-path.spec.ts`
Complete happy path test that goes through all application steps without using voice dictation. Tests:
- Application creation
- All step navigation
- Data persistence
- Complete form filling

### `accessibility.spec.ts`
Accessibility and Section 508 compliance tests using axe-core. Tests:
- ARIA attributes
- Keyboard navigation
- Screen reader compatibility
- Color contrast (WCAG)
- Form label associations
- Error message announcements
- Heading structure
- Focus management

### `validation.spec.ts`
Validation rule tests. Tests:
- Required field validation
- Email format validation
- Phone number format validation
- SSN format validation
- Date of birth age validation (18+)
- Employment field validation
- Money input validation
- Address validation
- Assets step validation (requires at least one asset)
- Error clearing when fields are corrected

### `functionality.spec.ts`
Comprehensive functionality tests for all steps. Tests:
- **Client Information**: Co-borrower management, former addresses, mailing address toggle
- **Employment**: Multiple records, auto-fill end dates, conditional field visibility, offer letter logic
- **Income**: Filtering to show only current employment
- **Assets**: Add/remove assets
- **Real Estate**: Add/remove properties
- **Documents**: Condition generation based on application data
- **Review**: Data display, MISMO export
- **Navigation**: Step completion status, URL persistence

### `step-validation.spec.ts`
Focused step-by-step validation tests.

### `helpers.ts`
Reusable helper functions for common test operations.

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in UI mode
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test tests/happy-path.spec.ts

# Run tests with accessibility checks only
npx playwright test tests/accessibility.spec.ts
```

## Test Requirements

- Firebase emulator must be running (for data persistence tests)
- Development server will start automatically via Playwright config
- Tests use real form interactions and validation

## Accessibility Testing

Tests use `@axe-core/playwright` to check for:
- WCAG 2.1 AA compliance
- ARIA attribute correctness
- Keyboard navigation
- Screen reader compatibility
- Color contrast requirements

## Notes

- Voice dictation step is intentionally skipped in happy path
- All tests verify both functionality and accessibility
- Tests check for proper error handling and validation
- Data persistence is verified through page reloads


