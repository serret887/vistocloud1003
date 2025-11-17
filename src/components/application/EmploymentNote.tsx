import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { useApplicationStore } from '@/stores/applicationStore'

interface EmploymentNoteProps {
  clientId: string
}

export default function EmploymentNote({ clientId }: EmploymentNoteProps) {
  const { employmentData, updateEmploymentNote } = useApplicationStore()
  const [note, setNote] = useState('')
  
  const employmentDataForClient = employmentData[clientId]
  const currentNote = employmentDataForClient?.employmentNote || ''

  useEffect(() => {
    setNote(currentNote)
  }, [currentNote])

  const handleNoteChange = (value: string) => {
    setNote(value)
    updateEmploymentNote(clientId, value.trim() || null)
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          Employment History Note Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your employment history is less than 2 years. Please provide a note explaining your employment situation.
            This information will be reviewed during the application process.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Label htmlFor="employment-note">
            Employment History Explanation
          </Label>
          <Textarea
            id="employment-note"
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Please explain your employment situation, including any gaps in employment, career changes, or other relevant circumstances..."
            className="min-h-[100px]"
          />
          <p className="text-sm text-muted-foreground">
            This note will help us understand your employment background and may be required for loan approval.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
