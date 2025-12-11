export type ApplicationStatus =
  | "draft"
  | "in-progress"
  | "completed"
  | "suspended"
  | "declined"
  | "scheduled-to-close"
  | "closed"
  | "adverse-action"
  | "unacceptable-submission";

export type StepStatus = 'verified' | 'completed' | 'current' | 'pending' | 'error'

export type ApplicationStepId =
  | 'client-info'
  | 'employment'
  | 'income'
  | 'real-estate'
  | 'assets'
  | 'loan-info'
  | 'documents'
  | 'dictate'
  | 'review'

export interface ApplicationStepDefinition {
  id: ApplicationStepId
  title: string
  description: string
  estimatedTime: string
  fields: string[]
}

export interface ApplicationStepState {
  id: ApplicationStepId
  status: StepStatus
  completionPercentage: number
  errorCount: number
}

export type Application = {
  id: string; // Firestore doc id
  applicationNumber: string; // GUID/UUID
  createdAt: unknown; // Firestore Timestamp or ISO string depending on layer
  status: ApplicationStatus;
  ownerId: string;
  ownerWorkspace: string;
  source?: string;
  currentStepId?: ApplicationStepId;
  overallProgress?: number;
  updatedAt?: unknown;
};

export interface ApplicationFull {
  id: string
  applicantIds: string[]
  createdAt: string
  updatedAt: string
  currentStepId: ApplicationStepId
  steps: ApplicationStepState[]
  overallProgress: number
}

export interface Draft {
  id: string
  applicationId: string
  version: number
  updatedAt: string
  data: Record<string, unknown>
}

export interface ProgressSummary {
  overallPercentage: number
  perStep: Record<ApplicationStepId, number>
}

export interface ValidationIssue {
  id: string
  stepId: ApplicationStepId
  fieldId: string
  severity: 'info' | 'warning' | 'error'
  message: string
  createdAt: string
  resolvedAt?: string
}

export interface HelpTip {
  id: string
  scope: 'field' | 'section'
  targetId: string
  text: string
  createdAt: string
  updatedAt?: string
}

export interface DocumentItem {
  id: string
  applicationId: string
  type: string
  filename: string
  sizeBytes: number
  mimeType: string
  status: 'pending' | 'uploaded' | 'verified' | 'rejected'
  uploadedAt: string
  verifiedAt?: string
  notes?: string
}

export interface NavigationState {
  applicationId: string
  currentStepId: ApplicationStepId
  visitedStepIds: ApplicationStepId[]
  history: string[]
}

// Applications Table View Types
export interface DocAlerts {
  state: "OK" | "Needs Attention" | "Missing" | string
  icon: string
  message?: string
}

export interface ApplicationSummary {
  loanNumber: string
  clientName: string
  status: string
  statusDate: string // ISO string
  channel: string
  purpose: string
  lockExpiration: string | null // ISO string
  targetClosingDate: string | null // ISO string
  relativeDaysToTarget: number | null // server computed, positive=in days, negative=days ago
  docAlerts: DocAlerts
}

export interface TableQuery {
  page: number // 1-based
  pageSize: number // 10|25|50|100
  sortBy: string
  sortDir: "asc" | "desc"
  search?: string
  category?: string
}

export interface TableResult {
  items: ApplicationSummary[]
  total: number
  page: number
  pageSize: number
}
