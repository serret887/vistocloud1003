export type ConditionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type ConditionCategory = 'ID' | 'Income' | 'Assets' | 'Property' | 'Credit';

export interface ConditionNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface ConditionDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string; // Optional URL for actual file storage
}

export interface Condition {
  id: string;
  clientId: string;
  category: ConditionCategory;
  title: string;
  description: string;
  status: ConditionStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  notes: ConditionNote[];
  documents: ConditionDocument[];
}

export interface ConditionStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}