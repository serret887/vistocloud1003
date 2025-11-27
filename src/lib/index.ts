// Main exports for $lib alias

// Utilities
export { cn } from './utils';
export { generateId, generateFallbackId } from './idGenerator';

// Firebase
export { db, initFirebaseEmulator } from './firebase';

// Store
export { applicationStore, activeClientId, currentStepId, clientIds } from './stores/application';

// Application Steps
export { stepDefinitions, stepIdToSlug, defaultStepId, getStepPath, getStepIdFromPath } from './applicationSteps';
