import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { User, CreditCard, Calendar } from 'lucide-react'
import { useEffect } from 'react'
import NameField from '@/components/ui/fields/NameField'
import EmailField from '@/components/ui/fields/EmailField'
import PhoneField from '@/components/ui/fields/PhoneField'
import SSNField from '@/components/ui/fields/SSNField'
import DOBField from '@/components/ui/fields/DOBField'
// import { isAlphaName, validateEmail, validatePhoneLoose } from '@/lib/validators'
import { useApplicationStore } from '@/stores/applicationStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type ClientData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  ssn: string
  dob: string
  citizenship: string
  maritalStatus: string
  hasMilitaryService: boolean
}

export default function ClientPersonalInfoCard() {
  const activeId = useApplicationStore((state) => state.activeClientId);
  const currentData = useApplicationStore((state) => state.clients[activeId] || { firstName: '', lastName: '', email: '', phone: '', ssn: '', dob: '', citizenship: '', maritalStatus: '', hasMilitaryService: false, });

  const updateData = (updates: Partial<ClientData>) => {
    useApplicationStore.getState().updateClientData(activeId, updates);
  }

  const handleFieldBlur = (field: keyof ClientData, value: string | boolean) => {
    updateData({ [field]: value });
  }

  useEffect(() => {
    const handler = (e: Event) => {
      // Check all required fields
      const isFirstNameValid = !!currentData.firstName
      const isLastNameValid = !!currentData.lastName
      const isCitizenshipValid = !!currentData.citizenship
      const isMaritalStatusValid = !!currentData.maritalStatus
      
      if (!isFirstNameValid || !isLastNameValid || !isCitizenshipValid || !isMaritalStatusValid) {
        e.preventDefault()
      }
    }
    window.addEventListener('application:attempt-continue', handler)
    return () => window.removeEventListener('application:attempt-continue', handler)
  }, [currentData.firstName, currentData.lastName, currentData.citizenship, currentData.maritalStatus])

  // Remove the immediate onChange function - we'll use onBlur instead

  useEffect(() => {
    // Validation logic removed - keeping effect for potential future use
    // const ssnDigits = (currentData.ssn || '').replace(/\D/g, '')
    // const isAdult = (() => {
    //   const d = new Date(currentData.dob)
    //   if (isNaN(d.getTime())) return false
    //   const now = new Date()
    //   const eighteen = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
    //   return d <= eighteen
    // })()
    // const valid = isAlphaName(currentData.firstName) && isAlphaName(currentData.lastName) && validateEmail(currentData.email) && validatePhoneLoose(currentData.phone) && ssnDigits.length === 9 && isAdult
    // Removed window.dispatchEvent(new CustomEvent('client:valid', { detail: { value: valid } }))
  }, [currentData])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Provide the applicant's basic personal details and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent key={activeId} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NameField id="firstName" name="firstName" label="First name *" value={currentData.firstName} onBlur={(v) => handleFieldBlur('firstName', v)} required data-testid="first-name-input" />
            <NameField id="lastName" name="lastName" label="Last name *" value={currentData.lastName} onBlur={(v) => handleFieldBlur('lastName', v)} required data-testid="last-name-input" />
            <EmailField value={currentData.email} onBlur={(v) => handleFieldBlur('email', v)} data-testid="email-input" />
            <PhoneField value={currentData.phone} onBlur={(v) => handleFieldBlur('phone', v)} data-testid="phone-input" />
            <div className="space-y-2">
              <Label htmlFor="ssn" className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> SSN *
              </Label>
              <SSNField id="ssn" label="" value={currentData.ssn} onBlur={(v) => handleFieldBlur('ssn', v)} data-testid="ssn-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date of birth *
              </Label>
              <DOBField id="dob" label="" value={currentData.dob} onBlur={(v) => handleFieldBlur('dob', v)} data-testid="dob-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citizenship" className="flex items-center gap-1">Citizenship *</Label>
              <Select value={currentData.citizenship} onValueChange={(v: string) => handleFieldBlur('citizenship', v)} required>
                <SelectTrigger id="citizenship" className={!currentData.citizenship ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                  <SelectValue placeholder="Select citizenship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US Citizen">US Citizen</SelectItem>
                  <SelectItem value="Permanent Resident">Permanent Resident</SelectItem>
                  <SelectItem value="Non Permanent Resident">Non Permanent Resident</SelectItem>
                </SelectContent>
              </Select>
              {!currentData.citizenship && (
                <div role="alert" className="text-xs text-red-600">Please select a citizenship status</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maritalStatus" className="flex items-center gap-1">Marital Status *</Label>
              <Select value={currentData.maritalStatus} onValueChange={(v: string) => handleFieldBlur('maritalStatus', v)} required>
                <SelectTrigger id="maritalStatus" className={!currentData.maritalStatus ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                  <SelectValue placeholder="Select One" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unmarried">Unmarried</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Separated">Separated</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
              {!currentData.maritalStatus && (
                <div role="alert" className="text-xs text-red-600">Please select a marital status</div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <Label className="text-base font-medium">Military Status</Label>
            <div className="flex items-center space-x-2">
              <Switch id="hasMilitaryService" checked={currentData.hasMilitaryService} onCheckedChange={(checked: boolean) => handleFieldBlur('hasMilitaryService', checked)} />
              <Label htmlFor="hasMilitaryService">Did your client (or client's deceased spouse) ever serve, or are they currently serving, in the United States Armed Forces?</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


