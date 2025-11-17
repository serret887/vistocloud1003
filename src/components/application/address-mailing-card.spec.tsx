import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AddressMailingCard from '@/components/application/AddressMailingCard'

test('mailing address same-as-present disables address control', () => {
  render(<AddressMailingCard />)
  // When same-as-present, show hint
  expect(screen.getByText(/Using present address/i)).toBeInTheDocument()
  // Uncheck to enable address autocomplete
  const checkbox = screen.getByRole('checkbox')
  fireEvent.click(checkbox)
  expect(screen.getByPlaceholderText(/start typing address/i)).toBeInTheDocument()
})
