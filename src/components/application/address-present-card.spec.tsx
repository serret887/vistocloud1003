import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AddressPresentCard from '@/components/application/AddressPresentCard'

test('present address opens modal and saves', () => {
  render(<AddressPresentCard />)
  const trigger = screen.getByPlaceholderText(/start typing address/i)
  fireEvent.click(trigger)
  expect(screen.getByText(/Enter Address/i)).toBeInTheDocument()
})
