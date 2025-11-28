/**
 * Process transcription with Google Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMAction, LLMResponse } from '$lib/types/voice-assistant';
import type { LLMApplicationState } from './types';
import { buildSystemPrompt } from './promptBuilder';
import { generateDefaultNextSteps } from './nextStepsGenerator';
import { DEFAULT_LLM_CONFIG } from './config';

/**
 * Process transcription with Google Gemini
 */
export async function processWithGemini(
  transcription: string,
  currentState: LLMApplicationState,
  conversationHistory: any[] = []
): Promise<LLMResponse> {
  const apiKey = import.meta.env.PUBLIC_GOOGLE_AI_API_KEY || import.meta.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY or PUBLIC_GOOGLE_AI_API_KEY environment variable not set');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: DEFAULT_LLM_CONFIG.model || 'gemini-1.5-flash',
      generationConfig: {
        temperature: DEFAULT_LLM_CONFIG.temperature || 0.3,
        maxOutputTokens: DEFAULT_LLM_CONFIG.maxTokens || 4000,
        responseMimeType: 'application/json'
      }
    });

    const systemPrompt = buildSystemPrompt(currentState, conversationHistory);
    
    // Build conversation history for context
    const conversationContext = conversationHistory.slice(-4).map((msg: any) => {
      if (msg.role === 'assistant') {
        return `Assistant: I updated: ${msg.updates?.join(', ') || 'acknowledged'}`;
      }
      return `User: ${msg.content}`;
    }).join('\n');

    const userPrompt = `Extract mortgage application information from this spoken input:\n\n"${transcription}"`;

    const fullPrompt = `${systemPrompt}\n\n${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}${userPrompt}`;

    console.log('🤖 [GEMINI] Processing transcription with Gemini:', {
      model: DEFAULT_LLM_CONFIG.model || 'gemini-1.5-flash',
      transcriptionLength: transcription.length,
      hasHistory: conversationHistory.length > 0
    });

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ [GEMINI] Received response from Gemini');

    let parsedResult: any;
    try {
      // Try to parse as JSON
      parsedResult = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ [GEMINI] Failed to parse JSON response:', parseError);
      console.error('Raw response:', text);
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Could not parse Gemini response as JSON');
      }
    }

    // After parsing, analyze state if nextSteps is empty
    let nextSteps = parsedResult.nextSteps || '';

    if (!nextSteps) {
      nextSteps = generateDefaultNextSteps(currentState);
    }

    return {
      actions: parsedResult.actions || [],
      summary: parsedResult.summary || 'Information extracted',
      nextSteps: nextSteps
    };
  } catch (error) {
    console.error('❌ [GEMINI] Gemini processing error:', error);
    throw error;
  }
}

