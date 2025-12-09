# LLM Module

This module handles **client-side execution** of AI responses from the server.

## Purpose

The LLM module is responsible for:
1. **Converting store state** to the format expected by the server (`storeAdapter.ts`)
2. **Executing actions** returned from the server to update the application store (`actionExecutor.ts`)

## Important Note

**All AI processing, transformations, and validation happen server-side** via Firebase Functions:
- `transcribeAudio` - Converts audio to text
- `processConversation` - Processes text, resolves addresses, filters duplicates, validates actions, and returns structured actions

The server now handles:
- Address resolution using Google Places API
- Duplicate action filtering
- Action validation (phone numbers, emails, dates, amounts, etc.)
- Genkit tools for address resolution and validation

This client-side module only handles the **execution** of pre-processed, validated actions returned from the server.

## Files

### Core Files

- **`actionExecutor.ts`** - Executes actions on the application store (addClient, updateClientData, etc.)
- **`storeAdapter.ts`** - Converts Svelte store state to `LLMApplicationState` format for server communication
- **`types.ts`** - Type definitions for LLM processing

### Usage

```typescript
import { getCurrentLLMState } from '$lib/llm/storeAdapter';
import { processConversation } from '$lib/services/aiFunctions';
import { executeStoreAction } from '$lib/llm';

// 1. Get current state in LLM format
const currentState = getCurrentLLMState();

// 2. Call server to process conversation
// Server handles: address resolution, duplicate filtering, validation
const response = await processConversation(text, currentState, conversationHistory);

// 3. Execute pre-processed, validated actions on store
const dynamicIdMap = new Map();
for (const action of response.actions) {
  executeStoreAction(action, applicationStore, dynamicIdMap);
}
```

## Architecture

```
User Input (text/audio)
    ↓
Firebase Function: transcribeAudio (if audio)
    ↓
Firebase Function: processConversation
    - LLM generates actions (with tools for address resolution & validation)
    - Server resolves addresses using Google Places API
    - Server filters duplicate actions
    - Server validates all actions
    ↓
Returns: { actions (pre-processed & validated), summary, nextSteps, validationErrors? }
    ↓
Client-side LLM module:
    - executeStoreAction() (updates store)
    ↓
Application Store Updated
```



