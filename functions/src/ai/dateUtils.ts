/**
 * Date utility functions for LLM processing
 */

/**
 * Get current date information for LLM context
 */
export function getCurrentDateContext() {
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const todayReadable = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    today,
    todayFormatted,
    todayReadable,
  };
}



