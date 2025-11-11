import type { Condition, ConditionNote } from '@/types/conditions';

export function addConditionNote(
  condition: Condition,
  note: { content: string; author: string }
): Condition {
  const newNote: ConditionNote = {
    id: `${condition.id}-note-${Date.now()}`,
    content: note.content,
    author: note.author,
    createdAt: new Date().toISOString()
  };

  return {
    ...condition,
    notes: [...condition.notes, newNote],
    updatedAt: new Date().toISOString()
  };
}

