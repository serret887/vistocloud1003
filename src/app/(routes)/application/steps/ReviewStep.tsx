import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApplicationStore } from '@/stores/applicationStore'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { formatAddressMedium } from '@/lib/addressFormatter'

export default function ReviewStep() {
  const store = useApplicationStore()
  const activeClientId = store.activeClientId
  const client = store.clients[activeClientId]
  const addressData = store.getAddressData(activeClientId)
  const employmentData = store.employmentData[activeClientId]
  const incomeData = store.activeIncomeData[activeClientId] || []
  const assetsData = store.assetsData[activeClientId] || []
  const realEstateData = store.realEstateData[activeClientId]
  const conditionStats = store.getConditionStats(activeClientId)
  const conditions = store.getConditionsForClient(activeClientId)

  const getCompletionStatus = (data: any, required: boolean = true) => {
    if (!required) return { status: 'optional', icon: null, color: 'text-gray-500' }
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { status: 'missing', icon: XCircle, color: 'text-red-500' }
    }
    
    return { status: 'complete', icon: CheckCircle2, color: 'text-green-500' }
  }

  const getClientCompletionStatus = (client: any) => {
    if (!client) return { status: 'missing', icon: XCircle, color: 'text-red-500' }
    
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'citizenship', 'maritalStatus']
    const hasAllRequired = requiredFields.every(field => client[field] && client[field].trim() !== '')
    
    if (hasAllRequired) {
      return { status: 'complete', icon: CheckCircle2, color: 'text-green-500' }
    } else {
      return { status: 'incomplete', icon: AlertCircle, color: 'text-yellow-500' }
    }
  }

  const clientStatus = getClientCompletionStatus(client)
  const addressStatus = getCompletionStatus(addressData?.present?.addr?.formattedAddress)
  const employmentStatus = getCompletionStatus(employmentData?.records)
  const incomeStatus = getCompletionStatus(incomeData)
  const assetsStatus = getCompletionStatus(assetsData)
  const realEstateStatus = getCompletionStatus(realEstateData?.records, false)
  
  // Condition status - all must be completed
  const getConditionStatus = () => {
    if (conditionStats.total === 0) {
      return { status: 'missing', icon: AlertCircle, color: 'text-yellow-500' }
    }
    if (conditionStats.pending > 0 || conditionStats.inProgress > 0) {
      return { status: 'incomplete', icon: AlertCircle, color: 'text-yellow-500' }
    }
    return { status: 'complete', icon: CheckCircle2, color: 'text-green-500' }
  }
  
  const conditionStatus = getConditionStatus()

  const handleSubmit = () => {
    // Validate all sections are complete
    if (clientStatus.status !== 'complete' || 
        addressStatus.status !== 'complete' || 
        employmentStatus.status !== 'complete' || 
        incomeStatus.status !== 'complete' || 
        assetsStatus.status !== 'complete' ||
        conditionStatus.status !== 'complete') {
      alert('Please complete all required sections before submitting')
      return
    }
    
    // TODO: Implement actual backend submission
    // For now, just show a success message
    alert(`Application submitted successfully!\n\nSummary:\n- Client: ${client.firstName} ${client.lastName}\n- Total Conditions: ${conditionStats.total}\n- Completed Conditions: ${conditionStats.completed}\n\nYour application is now under review.`)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Review Your Application</h1>
        <p className="text-muted-foreground mt-2">
          Please review all information before submitting your application
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {clientStatus.icon && <clientStatus.icon className={`h-5 w-5 ${clientStatus.color}`} />}
              Client Information
            </CardTitle>
            <CardDescription>
              Personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {client ? (
              <div className="space-y-2">
                <div><strong>Name:</strong> {client.firstName} {client.lastName}</div>
                <div><strong>Email:</strong> {client.email}</div>
                <div><strong>Phone:</strong> {client.phone}</div>
                <div><strong>SSN:</strong> {client.ssn ? '***-**-' + client.ssn.slice(-4) : 'Not provided'}</div>
                <div><strong>DOB:</strong> {client.dob}</div>
                <div><strong>Citizenship:</strong> {client.citizenship}</div>
                <div><strong>Marital Status:</strong> {client.maritalStatus}</div>
              </div>
            ) : (
              <div className="text-red-500">No client information provided</div>
            )}
          </CardContent>
        </Card>

        {/* Address Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {addressStatus.icon && <addressStatus.icon className={`h-5 w-5 ${addressStatus.color}`} />}
              Address Information
            </CardTitle>
            <CardDescription>
              Current and previous addresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {addressData?.present?.addr ? (
              <div className="space-y-3">
                <div className="border rounded p-3">
                  <div className="font-semibold mb-2">Present Address</div>
                  <div>{formatAddressMedium(addressData.present.addr)}</div>
                  <div className="text-sm text-gray-600">
                    From: {addressData.present.fromDate || 'Not specified'}
                    {addressData.present.toDate ? ` - To: ${addressData.present.toDate}` : ' (Current)'}
                  </div>
                </div>
                {addressData.former?.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Former Addresses</div>
                    {addressData.former.map((address) => (
                      <div key={address.id} className="border rounded p-3 mb-2">
                        <div>{formatAddressMedium(address.addr)}</div>
                        <div className="text-sm text-gray-600">
                          From: {address.fromDate} - To: {address.toDate}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-500">No address information provided</div>
            )}
          </CardContent>
        </Card>

        {/* Employment Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {employmentStatus.icon && <employmentStatus.icon className={`h-5 w-5 ${employmentStatus.color}`} />}
              Employment History
            </CardTitle>
            <CardDescription>
              Employment records and work history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employmentData?.records?.length ? (
              <div className="space-y-3">
                {employmentData.records.map((record) => (
                  <div key={record.id} className="border rounded p-3">
                    <div><strong>Employer:</strong> {record.employerName}</div>
                    <div><strong>Position:</strong> {record.jobTitle}</div>
                    <div><strong>Period:</strong> {record.startDate} - {record.endDate || 'Current'}</div>
                    <div><strong>Type:</strong> {record.incomeType}</div>
                    {record.phoneNumber && <div><strong>Phone:</strong> {record.phoneNumber}</div>}
                    {record.employerAddress && (
                      <div><strong>Address:</strong> {formatAddressMedium(record.employerAddress)}</div>
                    )}
                    {record.selfEmployed && <div><strong>Self-Employed:</strong> Yes</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-red-500">No employment records provided</div>
            )}
          </CardContent>
        </Card>

        {/* Income Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {incomeStatus.icon && <incomeStatus.icon className={`h-5 w-5 ${incomeStatus.color}`} />}
              Income Information
            </CardTitle>
            <CardDescription>
              Active and passive income sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomeData.length ? (
              <div className="space-y-3">
                {incomeData.map((income) => (
                  <div key={income.id} className="border rounded p-3">
                    <div><strong>Company:</strong> {income.companyName}</div>
                    <div><strong>Position:</strong> {income.position}</div>
                    <div><strong>Monthly Amount:</strong> ${income.monthlyAmount?.toLocaleString()}</div>
                    {income.bonus && <div><strong>Bonus:</strong> ${income.bonus.toLocaleString()}</div>}
                    {income.commissions && <div><strong>Commissions:</strong> ${income.commissions.toLocaleString()}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-red-500">No income information provided</div>
            )}
          </CardContent>
        </Card>

        {/* Assets Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {assetsStatus.icon && <assetsStatus.icon className={`h-5 w-5 ${assetsStatus.color}`} />}
              Assets
            </CardTitle>
            <CardDescription>
              Financial assets and accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assetsData.length ? (
              <div className="space-y-3">
                {assetsData.map((asset) => (
                  <div key={asset.id} className="border rounded p-3">
                    <div><strong>Type:</strong> {asset.type}</div>
                    <div><strong>Amount:</strong> ${asset.amount?.toLocaleString()}</div>
                    {asset.accountNumber && <div><strong>Account:</strong> {asset.accountNumber}</div>}
                  </div>
                ))}
                <div className="font-semibold border-t pt-2">
                  Total Assets: ${assetsData.reduce((sum, asset) => sum + (asset.amount || 0), 0).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-red-500">No assets information provided</div>
            )}
          </CardContent>
        </Card>

        {/* Real Estate Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {realEstateStatus.icon && <realEstateStatus.icon className={`h-5 w-5 ${realEstateStatus.color}`} />}
              Real Estate
            </CardTitle>
            <CardDescription>
              Properties and real estate owned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {realEstateData?.records?.length ? (
              <div className="space-y-3">
                {realEstateData.records.map((property) => (
                  <div key={property.id} className="border rounded p-3">
                    <div><strong>Address:</strong> {property.address?.address1 || 'Not provided'}</div>
                    <div><strong>City:</strong> {property.address?.city || 'Not provided'}</div>
                    <div><strong>State:</strong> {property.address?.region || 'Not provided'}</div>
                    <div><strong>Current Residence:</strong> {property.currentResidence ? 'Yes' : 'No'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No real estate information provided (optional)</div>
            )}
          </CardContent>
        </Card>

        {/* Documents/Conditions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {conditionStatus.icon && <conditionStatus.icon className={`h-5 w-5 ${conditionStatus.color}`} />}
              Documents & Conditions
            </CardTitle>
            <CardDescription>
              Required documents and condition status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conditionStats.total > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded p-3">
                    <div className="text-2xl font-bold text-gray-900">{conditionStats.total}</div>
                    <div className="text-sm text-gray-600">Total Conditions</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="text-2xl font-bold text-green-600">{conditionStats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="text-2xl font-bold text-yellow-600">{conditionStats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="text-2xl font-bold text-blue-600">{conditionStats.inProgress}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                </div>
                
                {conditions.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <div className="font-semibold mb-2">Condition Summary:</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {conditions.map((condition) => (
                        <div key={condition.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span className="truncate flex-1">{condition.title}</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            condition.status === 'completed' ? 'bg-green-100 text-green-800' :
                            condition.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {condition.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-yellow-500">
                No conditions generated yet. Complete the previous steps to generate your document checklist.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary and Submit */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
          <CardDescription>
            Review the status of all sections before submitting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${clientStatus.color}`}>
                {clientStatus.status === 'complete' ? '✓' : clientStatus.status === 'incomplete' ? '⚠' : '✗'}
              </div>
              <div className="text-sm">Client Info</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${addressStatus.color}`}>
                {addressStatus.status === 'complete' ? '✓' : '✗'}
              </div>
              <div className="text-sm">Address</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${employmentStatus.color}`}>
                {employmentStatus.status === 'complete' ? '✓' : '✗'}
              </div>
              <div className="text-sm">Employment</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${incomeStatus.color}`}>
                {incomeStatus.status === 'complete' ? '✓' : '✗'}
              </div>
              <div className="text-sm">Income</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${assetsStatus.color}`}>
                {assetsStatus.status === 'complete' ? '✓' : '✗'}
              </div>
              <div className="text-sm">Assets</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${conditionStatus.color}`}>
                {conditionStatus.status === 'complete' ? '✓' : conditionStatus.status === 'incomplete' ? '⚠' : '✗'}
              </div>
              <div className="text-sm">Conditions</div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-red-700 hover:bg-red-800"
              disabled={
                clientStatus.status !== 'complete' || 
                addressStatus.status !== 'complete' || 
                employmentStatus.status !== 'complete' || 
                incomeStatus.status !== 'complete' || 
                assetsStatus.status !== 'complete' ||
                conditionStatus.status !== 'complete'
              }
            >
              Submit Application
            </Button>
            <Button variant="outline">
              Save as Draft
            </Button>
          </div>
          {(conditionStatus.status !== 'complete') && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 font-medium">
                <AlertCircle className="h-4 w-4" />
                <span>Action Required</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                {conditionStats.pending > 0 && `You have ${conditionStats.pending} pending condition${conditionStats.pending > 1 ? 's' : ''}. `}
                Please complete all document conditions before submitting your application.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
