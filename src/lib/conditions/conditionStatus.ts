import type { Condition, ConditionStatus } from '@/types/conditions';

export const VALIDATION_RULES = {
  required: ['title', 'description'],
  status: ['pending', 'in_progress', 'completed', 'cancelled'],
  priority: ['low', 'medium', 'high', 'urgent']
};

export function updateConditionStatus(condition: Condition, status: ConditionStatus): Condition {
  return {
    ...condition,
    status,
    updatedAt: new Date().toISOString()
  };
}

export function getConditionStats(conditions: Condition[]): {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
} {
  return conditions.reduce(
    (stats, condition) => {
      stats.total++;
      switch (condition.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'in_progress':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
      return stats;
    },
    {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0
    }
  );
}

