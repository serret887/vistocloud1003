// import { useEffect } from 'react'
import { useApplicationStore } from '@/stores/applicationStore'
import type { ApplicationStepId } from '@/models/application'

interface StepCompletionData {
  stepId: ApplicationStepId
  completionPercentage: number
  errorCount: number
}

export function useStepCompletion() {
  const store = useApplicationStore()

  const calculateClientInfoCompletion = (): number => {
    const activeClientId = store.activeClientId
    const client = store.clients[activeClientId]
    
    if (!client) return 0

    // Check personal information fields
    const hasFirstName = client.firstName?.trim() && client.firstName.trim().length > 0
    const hasLastName = client.lastName?.trim() && client.lastName.trim().length > 0
    const hasEmail = client.email?.trim() && client.email.trim().length > 0
    const hasPhone = client.phone?.trim() && client.phone.trim().length > 0
    const hasSSN = client.ssn?.trim() && client.ssn.replace(/\D/g, '').length === 9
    const hasDOB = client.dob?.trim() && client.dob.trim().length > 0
    const hasCitizenship = client.citizenship?.trim() && client.citizenship.trim().length > 0
    const hasMaritalStatus = client.maritalStatus?.trim() && client.maritalStatus.trim().length > 0

    // Check current address (present address)
    const addressData = store.addressData[activeClientId]
    const hasCurrentAddress = addressData?.present?.addr?.address1?.trim() && 
                             addressData.present.addr.address1.trim().length > 0 &&
                             addressData.present.addr.city?.trim() &&
                             addressData.present.addr.region?.trim()

    // Count completed fields (personal info + current address)
    const personalInfoFields = [hasFirstName, hasLastName, hasEmail, hasPhone, hasSSN, hasDOB, hasCitizenship, hasMaritalStatus]
    const completedPersonalFields = personalInfoFields.filter(Boolean).length
    const completedAddressFields = hasCurrentAddress ? 1 : 0
    
    const totalFields = 9 // 8 personal + 1 address
    const completedFields = completedPersonalFields + completedAddressFields
    
    return Math.round((completedFields / totalFields) * 100)
  }

  const calculateEmploymentCompletion = (): number => {
    const activeClientId = store.activeClientId
    const employmentData = store.employmentData[activeClientId]
    
    if (!employmentData?.records?.length) return 0

    // Check if we have at least 2 years of employment history
    const hasTwoYearsHistory = (() => {
      const now = new Date()
      
      let totalMonths = 0
      const validRecords = employmentData.records.filter(record => 
        record.startDate && record.employerName?.trim()
      )
      
      for (const record of validRecords) {
        const startDate = new Date(record.startDate)
        const endDate = record.endDate ? new Date(record.endDate) : now
        
        if (startDate <= endDate) {
          const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth())
          totalMonths += Math.max(0, months)
        }
      }
      
      return totalMonths >= 24 // 2 years = 24 months
    })()

    // Calculate completion based on filled fields in employment records
    let totalFields = 0
    let completedFields = 0

    employmentData.records.forEach(record => {
      // Check only the essential fields for employment completion
      const requiredFields = [
        record.employerName?.trim(),
        record.jobTitle?.trim(),
        record.startDate?.trim(),
        record.incomeType?.trim()
      ]
      
      totalFields += requiredFields.length
      completedFields += requiredFields.filter(field => field && field.length > 0).length
    })

    const fieldCompletion = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
    
    // Employment is complete if all required fields are filled AND we have 2 years of history
    // OR if we have 2 years of history and a note explaining the situation
    if (hasTwoYearsHistory && fieldCompletion === 100) {
      return 100
    } else if (hasTwoYearsHistory && employmentData.employmentNote?.trim()) {
      // Allow completion with note if less than 2 years but note is provided
      return 100
    } else if (fieldCompletion === 100 && employmentData.employmentNote?.trim()) {
      // Allow completion with note even if less than 2 years
      return 100
    } else if (hasTwoYearsHistory || fieldCompletion > 0) {
      // Partial completion if we have some history or some fields filled
      return Math.min(90, Math.max(fieldCompletion, hasTwoYearsHistory ? 50 : 0))
    }
    
    return 0
  }

  const calculateIncomeCompletion = (): number => {
    const activeClientId = store.activeClientId
    const activeIncome = store.activeIncomeData[activeClientId] || []
    const passiveIncome = store.passiveIncomeData[activeClientId] || []
    
    // Check if there's at least one complete income record
    const hasCompleteActiveIncome = activeIncome.some(income => 
      income.monthlyAmount && income.monthlyAmount > 0
    )
    const hasCompletePassiveIncome = passiveIncome.some(income => 
      income.monthlyAmount && income.monthlyAmount > 0
    )
    
    return (hasCompleteActiveIncome || hasCompletePassiveIncome) ? 100 : 0
  }

  const calculateAssetsCompletion = (): number => {
    const activeClientId = store.activeClientId
    const assets = store.assetsData[activeClientId] || []
    
    // Check if there's at least one complete asset record
    const hasCompleteAsset = assets.some(asset => 
      asset.type?.trim() && asset.amount && asset.amount > 0
    )
    
    return hasCompleteAsset ? 100 : 0
  }

  const calculateRealEstateCompletion = (): number => {
    const activeClientId = store.activeClientId
    const realEstate = store.realEstateData[activeClientId]
    const isVisited = store.isRealEstateVisited(activeClientId)
    
    // Real Estate is optional - if user visited the step, it's complete even with 0 records
    if (isVisited && (!realEstate?.records?.length || realEstate.records.length === 0)) {
      return 100
    }
    
    if (!realEstate?.records?.length) return 0
    
    // Check if there's at least one complete real estate record
    const hasCompleteRecord = realEstate.records.some(record => 
      record.address?.address1?.trim() && 
      record.propertyType?.trim()
    )
    
    return hasCompleteRecord ? 100 : 0
  }

  const calculateDocumentsCompletion = (): number => {
    // For now, documents step is not implemented, so return 0
    return 0
  }

  const calculateReviewCompletion = (): number => {
    // Review step is always 0% - it's for reviewing, not completion
    // It should never show a green checkbox
    return 0
  }

  const getStepCompletion = (stepId: ApplicationStepId): StepCompletionData => {
    let completionPercentage = 0
    const errorCount = 0

    switch (stepId) {
      case 'client-info':
        completionPercentage = calculateClientInfoCompletion()
        break
      case 'employment':
        completionPercentage = calculateEmploymentCompletion()
        break
      case 'income':
        completionPercentage = calculateIncomeCompletion()
        break
      case 'assets':
        completionPercentage = calculateAssetsCompletion()
        break
      case 'real-estate':
        completionPercentage = calculateRealEstateCompletion()
        break
      case 'documents':
        completionPercentage = calculateDocumentsCompletion()
        break
      case 'review':
        completionPercentage = calculateReviewCompletion()
        break
    }

    return {
      stepId,
      completionPercentage,
      errorCount
    }
  }

  return {
    getStepCompletion,
    calculateClientInfoCompletion,
    calculateEmploymentCompletion,
    calculateIncomeCompletion,
    calculateAssetsCompletion,
    calculateRealEstateCompletion,
    calculateDocumentsCompletion,
    calculateReviewCompletion
  }
}
