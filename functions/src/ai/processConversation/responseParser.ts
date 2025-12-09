/**
 * Parse AI response JSON
 */

/**
 * Parse JSON response from AI, handling markdown code blocks
 */
export function parseAIResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error('Failed to parse JSON response:', parseError);
    console.error('Raw response:', text);
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    throw new Error('Could not parse AI response as JSON');
  }
}

