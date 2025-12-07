# Firebase Functions - AI Processing

This directory contains Firebase Cloud Functions for AI-powered features using Genkit and Vertex AI.

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment Variables

For local development with emulators, create a `.env` file in the `functions` directory:

```bash
# For Vertex AI Express Mode (recommended for easy setup)
GOOGLE_AI_API_KEY=your-api-key-here

# Optional: Override default model configuration
AI_PROVIDER=vertexExpress  # Options: 'vertex', 'vertexExpress', 'googleAI'
AI_MODEL=gemini-1.5-flash  # Options: 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', etc.
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=4000
VERTEX_AI_LOCATION=global  # For Vertex AI: 'global', 'us-central1', etc.
```

### 3. Set Up Secrets for Production

For production deployment, use Firebase Secret Manager:

```bash
# Set the API key as a secret
firebase functions:secrets:set GOOGLE_AI_API_KEY
# Paste your API key when prompted
```

### 4. Run with Emulators

```bash
# From project root
npm run emulators:start

# Or from functions directory
npm run serve
```

The functions will be available at:
- `http://localhost:5001/YOUR_PROJECT_ID/us-central1/transcribeAudio`
- `http://localhost:5001/YOUR_PROJECT_ID/us-central1/processConversation`

## Available Functions

### `transcribeAudio`

Converts audio to text using Google Speech-to-Text API.

**Input:**
```typescript
{
  audioBase64: string;  // Base64 encoded audio
  mimeType: string;     // Audio MIME type (e.g., 'audio/webm')
}
```

**Output:**
```typescript
{
  transcription: string;
}
```

### `processConversation`

Processes text input and returns structured actions for updating the mortgage application.

**Input:**
```typescript
{
  transcription: string;              // User's text input
  currentState: LLMApplicationState;  // Current application state
  conversationHistory?: any[];       // Previous conversation messages
}
```

**Output:**
```typescript
{
  actions: LLMAction[];  // Actions to update the application
  summary: string;       // Summary of what was extracted
  nextSteps?: string;    // Guidance for next steps
}
```

## Model Configuration

You can easily swap models by changing the configuration in `src/config/modelConfig.ts` or via environment variables:

- **Provider Options:**
  - `vertex`: Full Vertex AI with Application Default Credentials (requires GCP setup)
  - `vertexExpress`: Vertex AI Express Mode with API key (easier setup)
  - `googleAI`: Gemini Developer API (simplest, but less enterprise features)

- **Model Options:**
  - `gemini-1.5-flash`: Fast and efficient (default)
  - `gemini-1.5-pro`: More capable, slower
  - `gemini-2.0-flash`: Latest fast model
  - `gemini-2.5-flash`: Latest optimized model

## Local Development

1. Start Firebase emulators:
   ```bash
   firebase emulators:start --only functions
   ```

2. The functions will automatically reload when you make changes (if using `npm run build:watch`)

3. Test the functions using the Firebase emulator UI or by calling them from your client code

## Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:transcribeAudio
firebase deploy --only functions:processConversation
```

## Troubleshooting

### Functions not working in emulator

1. Make sure emulators are running: `firebase emulators:start --only functions`
2. Check that `GOOGLE_AI_API_KEY` is set in your `.env` file
3. Verify the function URLs in the emulator UI

### API Key errors

- For local development: Use `.env` file in `functions` directory
- For production: Use Firebase Secret Manager (`firebase functions:secrets:set`)

### Model not found errors

- Check that the model name is correct for your provider
- Vertex AI models: `gemini-1.5-flash`, `gemini-1.5-pro`, etc.
- Google AI models: Same names, but may have different availability



