# LLM Module

This module handles **client-side processing** of AI responses from the server.

## Purpose

The LLM module is responsible for:
1. **Converting store state** to the format expected by the server (`storeAdapter.ts`)
2. **Executing actions** returned from the server to update the application store (`actionExecutor.ts`)
3. **Processing actions** before execution (address resolution, duplicate filtering)

## Important Note

**All AI processing happens server-side** via Firebase Functions:
- `transcribeAudio` - Converts audio to text
- `processConversation` - Processes text and returns structured actions

This client-side module only handles the **execution** of actions returned from the server.

## Files

### Core Files

- **`actionExecutor.ts`** - Executes actions on the application store (addClient, updateClientData, etc.)
- **`addressResolver.ts`** - Resolves addresses in actions using Google Places API
- **`duplicateFilter.ts`** - Filters out duplicate actions before execution
- **`storeAdapter.ts`** - Converts Svelte store state to `LLMApplicationState` format for server communication
- **`types.ts`** - Type definitions for LLM processing

### Usage

```typescript
import { getCurrentLLMState } from '$lib/llm/storeAdapter';
import { processConversation } from '$lib/services/aiFunctions';
import { resolveAddressesInActions, filterDuplicateActions, executeStoreAction } from '$lib/llm';

// 1. Get current state in LLM format
const currentState = getCurrentLLMState();

// 2. Call server to process conversation
const response = await processConversation(text, currentState, conversationHistory);

// 3. Process actions (resolve addresses, filter duplicates)
const resolvedActions = await resolveAddressesInActions(response.actions);
const filteredActions = filterDuplicateActions(resolvedActions, applicationStore);

// 4. Execute actions on store
const dynamicIdMap = new Map();
for (const action of filteredActions) {
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
    ↓
Returns: { actions, summary, nextSteps }
    ↓
Client-side LLM module:
    - resolveAddressesInActions()
    - filterDuplicateActions()
    - executeStoreAction() (updates store)
    ↓
Application Store Updated
```

