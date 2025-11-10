import type { ApplicationStepId } from '../../models/application'

export const stepIdToPath: Record<ApplicationStepId, string> = {
  'client-info': '/application/client-info',
  'employment': '/application/employment',
  'income': '/application/income',
  'real-estate': '/application/real-estate',
  'assets': '/application/assets',
  'documents': '/application/documents',
  'dictate': '/application/dictate',
  'review': '/application/review',
}


