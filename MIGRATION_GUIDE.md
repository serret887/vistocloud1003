# Migration Guide: Moving AI to Firebase Functions

This guide explains the migration from client-side AI calls to server-side Firebase Functions with Genkit and Vertex AI.

## What Changed

### Before
- AI processing happened directly in the browser
- API keys were exposed in client-side code (security risk)
- Direct calls to Gemini API from `geminiProcessor.ts`
- Direct calls to Speech-to-Text API from `speech-to-text.ts`

### After
- All AI processing moved to Firebase Cloud Functions
- API keys stored securely server-side
- Two-step flow: Transcribe → Review → Process
- Uses Genkit framework with Vertex AI for better observability

## New Architecture

### Firebase Functions

1. **`transcribeAudio`** - Converts audio to text
   - Location: `functions/src/ai/transcribeAudio.ts`
   - Uses Google Speech-to-Text API
   - Returns transcription text

2. **`processConversation`** - Processes text and returns actions
   - Location: `functions/src/ai/processConversation.ts`
   - Uses Genkit with Vertex AI
   - Returns structured actions for updating the application

### Client-Side Changes

- **`src/lib/services/aiFunctions.ts`** - New service for calling Firebase Functions
- **`src/lib/components/steps/DictateStep.svelte`** - Updated with two-step flow:
  1. User records/uploads audio → Transcription appears (editable)
  2. User reviews/edits transcription → Clicks "Send to AI" → Gets actions and response

## Setup Instructions

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `functions` directory:

```bash
# Required: Google AI API Key
GOOGLE_AI_API_KEY=your-api-key-here

# Optional: Model configuration
AI_PROVIDER=vertexExpress  # 'vertex', 'vertexExpress', or 'googleAI'
AI_MODEL=gemini-1.5-flash
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=4000
VERTEX_AI_LOCATION=global
```

### 3. Set Up Secrets for Production

For production deployment:

```bash
firebase functions:secrets:set GOOGLE_AI_API_KEY
# Paste your API key when prompted
```

### 4. Run with Emulators

```bash
# From project root
npm run emulators:start

# Or start functions emulator separately
cd functions
npm run serve
```

The functions will be available at:
- `http://localhost:5001/YOUR_PROJECT_ID/us-central1/transcribeAudio`
- `http://localhost:5001/YOUR_PROJECT_ID/us-central1/processConversation`

### 5. Update Client Configuration

Make sure your Firebase configuration includes Functions:

```typescript
// In your Firebase config
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const functions = getFunctions();
if (import.meta.env.DEV) {
  // Connect to emulator in development
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

## Model Configuration

You can easily swap models by changing the configuration:

### Provider Options

- **`vertex`**: Full Vertex AI with Application Default Credentials (requires GCP setup)
- **`vertexExpress`**: Vertex AI Express Mode with API key (recommended, easier setup)
- **`googleAI`**: Gemini Developer API (simplest, but less enterprise features)

### Model Options

- `gemini-1.5-flash`: Fast and efficient (default)
- `gemini-1.5-pro`: More capable, slower
- `gemini-2.0-flash`: Latest fast model
- `gemini-2.5-flash`: Latest optimized model

Change in `functions/src/config/modelConfig.ts` or via environment variables.

## User Flow

### New Two-Step Process

1. **Transcribe Step**:
   - User records audio or uploads file
   - Audio is sent to `transcribeAudio` function
   - Transcription appears in chat (editable)

2. **Process Step**:
   - User reviews and can edit the transcription
   - User clicks "Send to AI" button
   - Text is sent to `processConversation` function
   - AI processes and returns actions + response
   - Application is updated automatically

### Benefits

- ✅ User can review and correct transcriptions before processing
- ✅ Better accuracy (user can fix speech-to-text errors)
- ✅ More control over what gets processed
- ✅ API keys stay secure on server

## Troubleshooting

### Functions not working in emulator

1. Check that emulators are running: `firebase emulators:start --only functions`
2. Verify `GOOGLE_AI_API_KEY` is set in `functions/.env`
3. Check function URLs in emulator UI

### API Key errors

- **Local**: Use `.env` file in `functions` directory
- **Production**: Use Firebase Secret Manager

### Model not found errors

- Verify model name is correct for your provider
- Check that provider supports the model (e.g., `gemini-2.5-flash` may not be available in all providers)

### Client can't connect to functions

- Check Firebase configuration includes Functions
- Verify emulator connection in development
- Check CORS settings in function configuration

## Security Notes

- ✅ API keys are now server-side only
- ✅ No sensitive data exposed to browser
- ✅ Functions can be secured with Firebase Auth
- ✅ Rate limiting can be added at function level

## Next Steps

- Consider adding Firebase Auth to functions for user authentication
- Add rate limiting to prevent abuse
- Set up monitoring and logging
- Consider adding caching for common queries



