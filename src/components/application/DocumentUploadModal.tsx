import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DocumentUploadModalProps {
  open: boolean
  onClose: () => void
  onUpload: (files: File[], selectedDocIds: string[]) => void
  conditionTitle: string
  existingDocuments: any[] // Array of documents already in the library
  onRemoveFromLibrary?: (documentId: string) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export default function DocumentUploadModal({
  open,
  onClose,
  onUpload,
  conditionTitle,
  existingDocuments,
  onRemoveFromLibrary,
}: DocumentUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedExistingDocs, setSelectedExistingDocs] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: File type not supported. Please upload PDF, JPG, PNG, or DOC files.`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size exceeds 10MB limit.`
    }
    return null
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files)
    const validFiles: File[] = []
    let errorMessage = ''

    newFiles.forEach((file) => {
      const validationError = validateFile(file)
      if (validationError) {
        errorMessage = validationError
      } else {
        validFiles.push(file)
      }
    })

    if (errorMessage) {
      setError(errorMessage)
    } else {
      setError(null)
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setError(null)
  }

  const toggleExistingDoc = (docId: string) => {
    setSelectedExistingDocs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(docId)) {
        newSet.delete(docId)
      } else {
        newSet.add(docId)
      }
      return newSet
    })
  }

  const handleUpload = () => {
    if (selectedFiles.length === 0 && selectedExistingDocs.size === 0) return
    onUpload(selectedFiles, Array.from(selectedExistingDocs))
    setSelectedFiles([])
    setSelectedExistingDocs(new Set())
    setError(null)
    onClose()
  }

  const handleClose = () => {
    setSelectedFiles([])
    setSelectedExistingDocs(new Set())
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>{conditionTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragging 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragging ? 'text-red-500' : 'text-gray-400'}`} />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              PDF, JPG, PNG, or DOC files up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Submitted Files - Newly selected files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-900">
                Submitted Files - {selectedFiles.length}
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your Uploads - Existing documents from library */}
          {existingDocuments.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-semibold text-sm text-gray-900">
                Your Uploads - {existingDocuments.length}
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {existingDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedExistingDocs.has(doc.id)
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleExistingDoc(doc.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedExistingDocs.has(doc.id)}
                        onChange={() => toggleExistingDoc(doc.id)}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(doc.size)} • {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          alert('Preview functionality would open the document here')
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Preview
                      </button>
                      {onRemoveFromLibrary && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Remove "${doc.name}" from your uploads?`)) {
                              onRemoveFromLibrary(doc.id)
                            }
                          }}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 && selectedExistingDocs.size === 0}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            {selectedFiles.length === 0 && selectedExistingDocs.size > 0 
              ? `Attach Selected (${selectedExistingDocs.size})`
              : selectedFiles.length > 0 && selectedExistingDocs.size > 0
              ? `Upload & Attach (${selectedFiles.length + selectedExistingDocs.size})`
              : `Upload (${selectedFiles.length})`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

