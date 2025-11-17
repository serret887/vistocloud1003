import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApplicationStore } from '@/stores/applicationStore'
import { FileText, MessageSquare, ChevronDown, ChevronUp, MoreVertical, File, X } from 'lucide-react'
import ClientTabs from './ClientTabs'
import DocumentUploadModal from '@/components/DocumentUploadModal'
import type { Condition, ConditionDocument } from '@/types/conditions'
import { generateDocumentId } from '@/lib/idGenerator'

// Condition Card Component matching the design
function ConditionCard({ condition, onUpload, onAddNote, onRemoveDocument, onStatusChange }: { 
  condition: Condition
  onUpload: (conditionId: string) => void
  onAddNote: (conditionId: string, note: string) => void
  onRemoveDocument: (conditionId: string, documentId: string) => void
  onStatusChange: (conditionId: string, status: 'pending' | 'in_progress' | 'completed') => void
}) {
  const [showAllActivity, setShowAllActivity] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNote, setNewNote] = useState('')

  const getStatusBadge = () => {
    switch (condition.status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Revision Requested</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    })
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(condition.id, newNote.trim())
      setNewNote('')
      setShowAddNote(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Card className="mb-6 w-full">
      <CardContent className="p-6 pt-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{condition.title}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-gray-700">{condition.description}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Uploaded Documents */}
        {condition.documents.length > 0 && (
          <div className="mb-4 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
              <File className="h-4 w-4" />
              <span>Uploaded Documents ({condition.documents.length})</span>
            </div>
            <div className="space-y-2">
              {condition.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.size)} • Uploaded by {doc.uploadedBy} • {formatDateTime(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDocument(condition.id, doc.id)}
                    className="h-8 w-8 p-0 flex-shrink-0 hover:bg-red-100 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Section - Only shown when expanded */}
        {showAllActivity && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
              <MessageSquare className="h-4 w-4" />
              <span>Activity</span>
            </div>
            {condition.notes.length > 0 ? (
              <div className="space-y-3">
                {condition.notes.slice().reverse().map((note) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{note.author}</span>
                      <span className="text-sm text-gray-600">
                        {formatDateTime(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No activity yet</p>
            )}
          </div>
        )}

        {/* Add Note Section */}
        {showAddNote && (
          <div className="border-t border-gray-200 pt-4 mb-4 space-y-3">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddNote} size="sm" disabled={!newNote.trim()}>
                Submit Note
              </Button>
              <Button onClick={() => setShowAddNote(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200 gap-3">
          <Button
            variant="ghost"
            onClick={() => setShowAllActivity(!showAllActivity)}
            className="text-gray-700 hover:text-gray-900"
          >
            {showAllActivity ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Activity
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                View Activity
              </>
            )}
          </Button>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowAddNote(!showAddNote)}
            >
              Add Comment
            </Button>
            <Button
              onClick={() => onUpload(condition.id)}
              className="bg-red-700 hover:bg-red-800 text-white whitespace-nowrap"
            >
              Add Documents
            </Button>
            {condition.status === 'pending' && condition.documents.length > 0 && (
              <Button
                onClick={() => onStatusChange(condition.id, 'completed')}
                className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
              >
                Mark Complete
              </Button>
            )}
            {condition.status === 'completed' && (
              <Button
                onClick={() => onStatusChange(condition.id, 'pending')}
                variant="outline"
                className="whitespace-nowrap"
              >
                Reopen
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DocumentsStep() {
  const {
    activeClientId,
    clients,
    generateConditionsForClient,
    getConditionsForClient,
    getConditionStats,
    addConditionNote,
    addConditionDocument,
    removeConditionDocument,
    updateConditionStatus,
    addToDocumentLibrary,
    getDocumentLibrary,
    removeFromDocumentLibrary
  } = useApplicationStore()

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null)

  const client = clients[activeClientId]
  const conditions = activeClientId ? getConditionsForClient(activeClientId) : []
  const stats = activeClientId ? getConditionStats(activeClientId) : { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 }
  const selectedCondition = conditions.find(c => c.id === selectedConditionId)
  const documentLibrary = getDocumentLibrary()

  // Generate conditions when component mounts or client changes
  useEffect(() => {
    if (activeClientId) {
      generateConditionsForClient(activeClientId)
    }
  }, [activeClientId, generateConditionsForClient])

  const handleUpload = (conditionId: string) => {
    setSelectedConditionId(conditionId)
    setUploadModalOpen(true)
  }

  const handleFilesUpload = (files: File[], selectedDocIds: string[]) => {
    if (!selectedConditionId || !activeClientId) return

    const userName = client?.firstName ? `${client.firstName} ${client.lastName}` : 'User'
    const { currentApplicationId } = useApplicationStore.getState()
    
    // Handle new file uploads
    files.forEach((file) => {
      const document: ConditionDocument = {
        id: generateDocumentId(currentApplicationId || undefined),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userName,
        // In a real implementation, you would upload the file to a storage service
        // and store the URL here. For now, we'll store it in memory.
      }
      
      // Add to document library
      addToDocumentLibrary(document)
      
      // Attach to condition
      addConditionDocument(activeClientId, selectedConditionId, document)
    })
    
    // Handle selected existing documents
    selectedDocIds.forEach((docId) => {
      const existingDoc = documentLibrary.find(doc => doc.id === docId)
      if (existingDoc) {
        // Attach existing document to condition
        addConditionDocument(activeClientId, selectedConditionId, existingDoc)
      }
    })
  }

  const handleRemoveDocument = (conditionId: string, documentId: string) => {
    if (activeClientId) {
      removeConditionDocument(activeClientId, conditionId, documentId)
    }
  }

  const handleRemoveFromLibrary = (documentId: string) => {
    // Remove from library and from all conditions that reference it
    removeFromDocumentLibrary(documentId)
    // Also remove from any conditions that have this document
    if (activeClientId) {
      conditions.forEach((condition) => {
        if (condition.documents.some(doc => doc.id === documentId)) {
          removeConditionDocument(activeClientId, condition.id, documentId)
        }
      })
    }
  }

  const handleStatusChange = (conditionId: string, status: 'pending' | 'in_progress' | 'completed') => {
    if (activeClientId) {
      updateConditionStatus(activeClientId, conditionId, status)
    }
  }

  const handleAddNote = (conditionId: string, noteContent: string) => {
    if (activeClientId) {
      const newNote = {
        id: `note-${Date.now()}`,
        content: noteContent,
        author: client?.firstName ? `${client.firstName} ${client.lastName}` : 'User',
        createdAt: new Date().toISOString()
      }
      addConditionNote(activeClientId, conditionId, newNote)
    }
  }

  // Group conditions by category (show all, not just pending)
  const idConditions = conditions.filter((c: Condition) => c.category === 'ID')
  const incomeConditions = conditions.filter((c: Condition) => c.category === 'Income')
  const assetsConditions = conditions.filter((c: Condition) => c.category === 'Assets')
  const propertyConditions = conditions.filter((c: Condition) => c.category === 'Property')
  const creditConditions = conditions.filter((c: Condition) => c.category === 'Credit')

  // Show loading state if no active client
  if (!activeClientId) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <ClientTabs />
        <div className="text-center py-12">
          <p className="text-gray-500">Please select a client to view documents.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Client tabs */}
      <ClientTabs />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documentation</CardTitle>
          <CardDescription>
            Based on your application, we need the following documents from {client?.firstName || 'you'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Required</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {conditions.length === 0 ? (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            No documents required yet. Complete the previous steps to generate your document checklist.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="id" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="id">
              ID ({idConditions.length})
            </TabsTrigger>
            <TabsTrigger value="income">
              Income ({incomeConditions.length})
            </TabsTrigger>
            <TabsTrigger value="assets">
              Assets ({assetsConditions.length})
            </TabsTrigger>
            <TabsTrigger value="property">
              Property ({propertyConditions.length})
            </TabsTrigger>
            <TabsTrigger value="credit">
              Credit ({creditConditions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="id" className="mt-6">
            {idConditions.length > 0 ? (
              idConditions.map((condition: Condition) => (
                <ConditionCard
                  key={condition.id}
                  condition={condition}
                  onUpload={handleUpload}
                  onAddNote={handleAddNote}
                  onRemoveDocument={handleRemoveDocument}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No ID documents required
              </div>
            )}
          </TabsContent>

          <TabsContent value="income" className="mt-6">
            {incomeConditions.length > 0 ? (
              incomeConditions.map((condition: Condition) => (
                <ConditionCard
                  key={condition.id}
                  condition={condition}
                  onUpload={handleUpload}
                  onAddNote={handleAddNote}
                  onRemoveDocument={handleRemoveDocument}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No income documents required
              </div>
            )}
          </TabsContent>

          <TabsContent value="assets" className="mt-6">
            {assetsConditions.length > 0 ? (
              assetsConditions.map((condition: Condition) => (
                <ConditionCard
                  key={condition.id}
                  condition={condition}
                  onUpload={handleUpload}
                  onAddNote={handleAddNote}
                  onRemoveDocument={handleRemoveDocument}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No asset documents required
              </div>
            )}
          </TabsContent>

          <TabsContent value="property" className="mt-6">
            {propertyConditions.length > 0 ? (
              propertyConditions.map((condition: Condition) => (
                <ConditionCard
                  key={condition.id}
                  condition={condition}
                  onUpload={handleUpload}
                  onAddNote={handleAddNote}
                  onRemoveDocument={handleRemoveDocument}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No property documents required
              </div>
            )}
          </TabsContent>

          <TabsContent value="credit" className="mt-6">
            {creditConditions.length > 0 ? (
              creditConditions.map((condition: Condition) => (
                <ConditionCard
                  key={condition.id}
                  condition={condition}
                  onUpload={handleUpload}
                  onAddNote={handleAddNote}
                  onRemoveDocument={handleRemoveDocument}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No credit documents required
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Document Upload Modal */}
      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false)
          setSelectedConditionId(null)
        }}
        onUpload={handleFilesUpload}
        conditionTitle={selectedCondition?.title || ''}
        existingDocuments={documentLibrary}
        onRemoveFromLibrary={handleRemoveFromLibrary}
      />
    </div>
  )
}
