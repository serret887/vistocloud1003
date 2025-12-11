/**
 * Build language context for prompt
 */

export function getLanguageContext(locale: string): string {
  return locale === 'es' 
    ? '\n\n**IMPORTANT: LANGUAGE CONTEXT**\nThe user is communicating in Spanish. You should:\n- Understand and process Spanish input\n- Respond in Spanish in the summary and nextSteps fields\n- Extract data correctly regardless of language\n- Use Spanish for all user-facing messages'
    : '\n\n**IMPORTANT: LANGUAGE CONTEXT**\nThe user is communicating in English. You should:\n- Understand and process English input\n- Respond in English in the summary and nextSteps fields\n- Extract data correctly regardless of language\n- Use English for all user-facing messages';
}


