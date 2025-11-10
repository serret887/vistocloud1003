import ClientPersonalInfoCard from '@/components/application/ClientPersonalInfoCard'
import AddressPresentCard from '@/components/application/AddressPresentCard'
import AddressMailingCard from '@/components/application/AddressMailingCard'
import ClientTabs from './ClientTabs'

export default function ClientInfoStep() {
  return (
    <div className="p-4">
      <ClientTabs />
      <h2 className="text-xl font-bold mb-4">Personal Information</h2>
      <ClientPersonalInfoCard />
      <div className="mt-6 space-y-6">
        <AddressPresentCard />
        <AddressMailingCard />
      </div>
    </div>
  )
}


