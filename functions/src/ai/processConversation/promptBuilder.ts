/**
 * Build prompt for AI generation
 */

import { buildSystemPrompt } from '../promptBuilder';

/**
 * Build full prompt with system prompt and conversation context
 */
export function buildFullPrompt(
  transcription: string,
  currentState: any,
  conversationHistory: any[],
  locale: string
): string {
  const systemPrompt = buildSystemPrompt(currentState, conversationHistory, locale);

  const conversationContext = conversationHistory.slice(-4).map((msg: any) => {
    if (msg.role === 'assistant') {
      return `Assistant: I updated: ${msg.updates?.join(', ') || 'acknowledged'}`;
    }
    return `User: ${msg.content}`;
  }).join('\n');

  const userPrompt = `Extract mortgage application information from this spoken input:\n\n"${transcription}"`;

  return `${systemPrompt}\n\n${
    conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''
  }${userPrompt}`;
}

