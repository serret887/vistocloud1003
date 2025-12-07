// Firebase save utilities
/**
 * Recursively removes undefined values from an object (Firebase doesn't accept undefined)
 * Converts undefined to null for Firebase compatibility
 */
export function sanitizeForFirebase<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirebase(item)) as T;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) {
        sanitized[key] = null;
      } else {
        sanitized[key] = sanitizeForFirebase(value);
      }
    }
    return sanitized as T;
  }
  
  return obj;
}


