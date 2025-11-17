import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AddressAutoComplete, { type AddressType } from '@/components/address-autocomplete'

function setup(initial?: Partial<AddressType>) {
  const address: AddressType = {
    address1: initial?.address1 ?? '',
    address2: initial?.address2 ?? '',
    formattedAddress: initial?.formattedAddress ?? '',
    city: initial?.city ?? '',
    region: initial?.region ?? '',
    postalCode: initial?.postalCode ?? '',
    country: initial?.country ?? '',
    lat: 0,
    lng: 0,
  }
  const setAddress = vi.fn()
  render(
    <AddressAutoComplete address={address} setAddress={setAddress} dialogTitle="Enter Address" />
  )
  return { setAddress }
}

test('opens dialog on input focus', () => {
  setup()
  const input = screen.getByPlaceholderText(/enter address/i)
  fireEvent.focus(input)
  expect(screen.getByText(/Enter Address/i)).toBeInTheDocument()
})

test('clear button appears and clears when formattedAddress present', () => {
  const { setAddress } = setup({ formattedAddress: '123 Main St, City, ST' })
  // clear button visible
  const clearBtn = screen.getByRole('button', { name: '' }) // icon button, no accessible name
  fireEvent.click(clearBtn)
  expect(setAddress).toHaveBeenCalled()
})
