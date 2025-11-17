import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DOBField from '@/components/fields/DOBField'

function blur(el: HTMLElement) { fireEvent.blur(el) }

describe('DOBField', () => {
  const today = new Date()
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  const nineteenYearsAgo = new Date(today.getFullYear() - 19, today.getMonth(), today.getDate())
  const seventeenYearsAgo = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())

  describe('Age validation', () => {
    test('accepts valid adult dates (18+ years old)', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      
      // Test exactly 18 years old
      const exactly18 = eighteenYearsAgo.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: exactly18 } })
      blur(input)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      
      // Test older than 18
      const olderThan18 = nineteenYearsAgo.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: olderThan18 } })
      blur(input)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    test('rejects dates that make person younger than 18', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      
      // Test 17 years old
      const seventeen = seventeenYearsAgo.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: seventeen } })
      blur(input)
      expect(screen.getByRole('alert')).toHaveTextContent(/at least 18 years old/)
    })

    test('rejects future dates', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      
      const futureDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
      const futureIso = futureDate.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: futureIso } })
      blur(input)
      expect(screen.getByRole('alert')).toHaveTextContent(/at least 18 years old/)
    })

    test('handles edge case: birthday not yet occurred this year', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      
      // Create a date where birthday hasn't occurred yet this year
      const birthdayNotYet = new Date(today.getFullYear() - 18, today.getMonth() + 1, today.getDate())
      const birthdayNotYetIso = birthdayNotYet.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: birthdayNotYetIso } })
      blur(input)
      expect(screen.getByRole('alert')).toHaveTextContent(/at least 18 years old/)
    })

    test('handles edge case: birthday occurred this year', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      
      // Create a date where birthday has occurred this year
      const birthdayOccurred = new Date(today.getFullYear() - 18, today.getMonth() - 1, today.getDate())
      const birthdayOccurredIso = birthdayOccurred.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: birthdayOccurredIso } })
      blur(input)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Required field validation', () => {
    test('shows no error when empty and not required', () => {
      render(<DOBField required={false} />)
      const input = screen.getByLabelText(/date of birth/i)
      blur(input)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    test('shows error when empty and required', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      blur(input)
      expect(screen.getByRole('alert')).toHaveTextContent(/at least 18 years old/)
    })
  })

  describe('Date picker restrictions', () => {
    test('sets max attribute to 18 years ago', () => {
      render(<DOBField />)
      const input = screen.getByLabelText(/date of birth/i) as HTMLInputElement
      
      const expectedMax = eighteenYearsAgo.toISOString().slice(0, 10)
      expect(input.max).toBe(expectedMax)
    })

    test('allows navigation to historical dates but restricts selection', () => {
      render(<DOBField />)
      const input = screen.getByLabelText(/date of birth/i) as HTMLInputElement
      
      // The max attribute should prevent selection of dates after 18 years ago
      expect(input.max).toBeDefined()
      expect(input.max).toBe(eighteenYearsAgo.toISOString().slice(0, 10))
    })
  })

  describe('Component props and behavior', () => {
    test('accepts custom id and label', () => {
      render(<DOBField id="custom-dob" label="Custom Birth Date" />)
      const input = screen.getByLabelText(/custom birth date/i)
      expect(input).toHaveAttribute('id', 'custom-dob')
    })

    test('calls onChange when value changes', () => {
      const onChange = vi.fn()
      render(<DOBField onChange={onChange} />)
      const input = screen.getByLabelText(/date of birth/i)
      
      const validDate = nineteenYearsAgo.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: validDate } })
      
      expect(onChange).toHaveBeenCalledWith(validDate)
    })

    test('syncs with external value prop', () => {
      const { rerender } = render(<DOBField value="" />)
      const input = screen.getByLabelText(/date of birth/i) as HTMLInputElement
      
      expect(input.value).toBe('')
      
      const newValue = nineteenYearsAgo.toISOString().slice(0, 10)
      rerender(<DOBField value={newValue} />)
      expect(input.value).toBe(newValue)
    })

    test('shows error styling when invalid and touched', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      
      const invalidDate = seventeenYearsAgo.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: invalidDate } })
      blur(input)
      
      expect(input).toHaveClass('border-red-500')
    })

    test('does not show error styling when valid', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      
      const validDate = nineteenYearsAgo.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: validDate } })
      blur(input)
      
      expect(input).not.toHaveClass('border-red-500')
    })
  })

  describe('Error message content', () => {
    test('shows appropriate error message for under 18', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      
      const under18 = seventeenYearsAgo.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: under18 } })
      blur(input)
      
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Must be at least 18 years old and not in the future')
    })

    test('error message is accessible with role="alert"', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      
      const under18 = seventeenYearsAgo.toISOString().slice(0, 10)
      fireEvent.change(input, { target: { value: under18 } })
      blur(input)
      
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('Leap year edge cases', () => {
    test('handles leap year birthday correctly', () => {
      render(<DOBField required />)
      const input = screen.getByLabelText(/date of birth/i)
      
      // Test leap year date (Feb 29)
      const leapYearBirthday = new Date(today.getFullYear() - 18, 1, 29) // February 29
      if (leapYearBirthday.getMonth() === 1 && leapYearBirthday.getDate() === 29) {
        const leapYearIso = leapYearBirthday.toISOString().slice(0, 10)
        fireEvent.change(input, { target: { value: leapYearIso } })
        blur(input)
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      }
    })
  })
})
