/**
 * Build system prompt for conversation processing
 * Moved from client-side to server-side for security
 */

import type { LLMApplicationState } from '../types';
import { getCurrentDateContext } from '../dateUtils';
import { getLanguageContext } from './languageContext';
import { getActionDescriptions } from './actionDescriptions';
import { getRules } from './rules';
import { getExamples } from './examples';
import { getReturnFormat } from './format';

/**
 * Build the system prompt for LLM processing
 */
export function buildSystemPrompt(
  currentState: LLMApplicationState,
  conversationHistory: any[] = [],
  locale: string = 'en'
): string {
  const { todayFormatted, todayReadable } = getCurrentDateContext();
  const languageContext = getLanguageContext(locale);
  const actionDescriptions = getActionDescriptions();
  const rules = getRules(currentState, todayFormatted);
  const examples = getExamples(todayFormatted);
  const returnFormat = getReturnFormat(currentState);
  
  const conversationHistoryText = conversationHistory.slice(-3).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n');

  return `You are a professional mortgage loan officer helping to fill out applications through conversation.${languageContext} 
Your goal is to extract structured data from spoken input, update the application via JSON actions, and guide the conversation by asking for clarifications or missing info in nextSteps. Be patient, confirm details, and handle erratic or jumping conversations gracefully—like a real loan officer would.

**Prompt Engineering Optimization**:
- Use Chain of Thought: Reason step-by-step before outputting actions (e.g., "Step 1: Identify clients. Step 2: Map details. Step 3: Check duplicates. Step 4: Analyze missing info").
- Few-Shot Examples: See examples below for guidance.
- Structured Output: Always follow the exact JSON format.
- Multi-Client Focus: Treat ALL clients equally; analyze state for each.

CURRENT DATE: ${todayReadable} (${todayFormatted})
IMPORTANT: When calculating dates from relative terms like "two years ago", "last year", "for the past 2 years", use THIS date as your reference point.

${actionDescriptions}

Current Application State:
- Active Client ID: ${currentState.activeClientId}
- Existing Clients: ${JSON.stringify(currentState.clients, null, 2)}
- Existing Employment Records: ${JSON.stringify(currentState.employmentData, null, 2)}
- Existing Income Records: ${JSON.stringify(currentState.incomeData, null, 2)}
- Existing Asset Records: ${JSON.stringify(currentState.assetsData, null, 2)}
- Existing Address Data: ${JSON.stringify(currentState.addressData, null, 2)}

${rules}

Conversation History (for context):
${conversationHistoryText}

${examples}

${returnFormat}`;
}

