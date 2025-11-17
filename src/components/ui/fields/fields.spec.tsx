import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import NameField from '@/components/components/fields/NameField'
import EmailField from '@/components/components/fields/EmailField'
import PhoneField from '@/components/components/fields/PhoneField'
import SSNField from '@/components/components/fields/SSNField'
import DOBField from '@/components/components/fields/DOBField'

function blur(el: HTMLElement) { fireEvent.blur(el) }

test('NameField rejects digits and shows error', () => {
  render(<NameField id="firstName" label="First name" required />)
  const input = screen.getByLabelText(/first name/i)
  fireEvent.change(input, { target: { value: 'J0hn' } })
  blur(input)
  expect(screen.getByRole('alert')).toHaveTextContent(/only letters/i)
})

test('EmailField invalid format shows error', () => {
  render(<EmailField />)
  const input = screen.getByLabelText(/email/i)
  fireEvent.change(input, { target: { value: 'bad@com' } })
  blur(input)
  expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i)
})

test('PhoneField requires at least 7 digits', () => {
  render(<PhoneField />)
  const input = screen.getByLabelText(/phone/i)
  fireEvent.change(input, { target: { value: '123' } })
  blur(input)
  expect(screen.getByRole('alert')).toHaveTextContent(/valid phone/i)
})

test('SSNField only digits and hyphens, formats and validates length', () => {
  render(<SSNField />)
  const input = screen.getByLabelText(/ssn/i)
  fireEvent.change(input, { target: { value: '12a3-4b5-6c789' } })
  // field should filter non-digit except hyphen and format
  expect((input as HTMLInputElement).value).toMatch(/^[\d-]*$/)
  blur(input)
  expect(screen.getByRole('alert')).toHaveTextContent(/9-digit/i)
})

test('DOBField fails for under 18', () => {
  render(<DOBField />)
  const input = screen.getByLabelText(/date of birth/i)
  const today = new Date()
  const tooYoung = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate())
  const iso = tooYoung.toISOString().slice(0, 10)
  fireEvent.change(input, { target: { value: iso } })
  blur(input)
  expect(screen.getByRole('alert')).toHaveTextContent(/at least 18/i)
})
