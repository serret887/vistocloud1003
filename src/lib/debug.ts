/**
 * Debug utilities for development
 */

const DEBUG_MODE = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';

export const debug = {
  enabled: DEBUG_MODE,
  
  log: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.warn('[DEBUG]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.error('[DEBUG]', ...args);
    }
  },
  
  group: (label: string) => {
    if (DEBUG_MODE) {
      console.group(`[DEBUG] ${label}`);
    }
  },
  
  groupEnd: () => {
    if (DEBUG_MODE) {
      console.groupEnd();
    }
  },
  
  table: (data: any) => {
    if (DEBUG_MODE) {
      console.table(data);
    }
  },
  
  // Log store updates
  storeUpdate: (action: string, data: any) => {
    if (DEBUG_MODE) {
      debug.group(`Store Update: ${action}`);
      debug.log('Action:', action);
      debug.log('Data:', data);
      debug.table(data);
      debug.groupEnd();
    }
  },
  
  // Log Firebase operations
  firebase: {
    save: (collection: string, docId: string, data: any) => {
      if (DEBUG_MODE) {
        debug.group(`Firebase Save: ${collection}/${docId}`);
        debug.log('Collection:', collection);
        debug.log('Document ID:', docId);
        debug.log('Data:', data);
        debug.groupEnd();
      }
    },
    
    load: (collection: string, docId: string, data: any) => {
      if (DEBUG_MODE) {
        debug.group(`Firebase Load: ${collection}/${docId}`);
        debug.log('Collection:', collection);
        debug.log('Document ID:', docId);
        debug.log('Data:', data);
        debug.groupEnd();
      }
    },
    
    error: (operation: string, error: any) => {
      if (DEBUG_MODE) {
        debug.error(`Firebase ${operation} failed:`, error);
      }
    }
  },
  
  // Log validation
  validation: (field: string, value: any, isValid: boolean, errors?: string[]) => {
    if (DEBUG_MODE) {
      const icon = isValid ? '✅' : '❌';
      debug.log(`${icon} Validation [${field}]:`, value, isValid ? 'VALID' : 'INVALID');
      if (errors && errors.length > 0) {
        debug.warn('Errors:', errors);
      }
    }
  }
};

// Export debug state for UI components
export const isDebugMode = DEBUG_MODE;


