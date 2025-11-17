import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AddressFormerList from '@/components/application/AddressFormerList'

test('add and remove former address rows', () => {
  render(<AddressFormerList />)
  const addBtn = screen.getByRole('button', { name: /Add Former Address/i })
  fireEvent.click(addBtn)
  expect(screen.getAllByText(/Enter Former Address/i).length).toBeGreaterThan(0)
  const removeBtn = screen.getByRole('button', { name: /Remove/i })
  fireEvent.click(removeBtn)
})
