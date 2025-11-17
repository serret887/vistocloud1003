import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

interface ValidationSuccessAlertProps {
  message: string
  isValid: boolean | (() => boolean)
  className?: string
}

export default function ValidationSuccessAlert({ message, isValid, className = '' }: ValidationSuccessAlertProps) {
  const shouldShow = typeof isValid === 'function' ? isValid() : isValid
  
  if (!shouldShow) {
    return null
  }
  
  return (
    <Alert className={className}>
      <CheckCircle className="h-4 w-4 text-green-600 !text-green-600" />
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
}

