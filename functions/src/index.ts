/**
 * Firebase Functions Entry Point
 * 
 * Exports all callable functions for the application
 */

import { setGlobalOptions } from "firebase-functions";

// Set global options for all functions
setGlobalOptions({ maxInstances: 10 });

// Export AI functions
export { transcribeAudio } from "./ai/transcribeAudio";
export { processConversation } from "./ai/processConversation";
