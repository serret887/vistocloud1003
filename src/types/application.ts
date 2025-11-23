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

import type { ApplicationStepId } from "@/app/models/application"

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




