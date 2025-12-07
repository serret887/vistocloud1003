# Voice Dictation Setup

## Overview

The voice dictation feature uses Google AI services to transcribe voice recordings and automatically populate the mortgage application form using Google Gemini.

## Features

1. **Voice Recording**: Records audio from the user's microphone
2. **Speech-to-Text**: Transcribes audio using Google Speech-to-Text API
3. **AI Processing**: Uses Google Gemini to extract structured data from transcription
4. **Auto-Population**: Automatically fills form fields based on extracted information
5. **Address Resolution**: Automatically resolves addresses using Google Places API

## Environment Variables

Add the following to your `.env.local` file:

```bash
# Google AI API Key (for Gemini and Speech-to-Text)
PUBLIC_GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Or use non-public variable (for server-side only)
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
```

**Note**: The system will check for `PUBLIC_GOOGLE_AI_API_KEY` first (for client-side use), then fall back to `GOOGLE_AI_API_KEY`.

## Getting a Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env.local` file

## How It Works

1. **User clicks record button** → Starts recording audio from microphone
2. **User clicks stop** → Recording stops and audio blob is created
3. **Transcription** → Audio is sent to Google Speech-to-Text API
4. **AI Processing** → Transcription is sent to Google Gemini with current application state
5. **Action Generation** → Gemini returns structured actions (addClient, updateClientData, etc.)
6. **Address Resolution** → Addresses in actions are resolved using Google Places API
7. **Duplicate Filtering** → Duplicate actions are filtered out
8. **Store Updates** → Actions are executed to update the Svelte store
9. **Firebase Save** → Changes are automatically saved to Firestore

## Example Usage

Say something like:
> "John Smith lives at 123 Main Street, New York. He works at Tech Corp and makes $5000 per month. His phone number is 555-123-4567 and his email is john@example.com."

The system will:
- Create/update client "John Smith"
- Set address to "123 Main Street, New York" (resolved via Google Places)
- Add employment record for "Tech Corp"
- Add income record with $5000/month
- Update phone and email

## Technical Details

### Components

- **`DictateStep.svelte`**: Main UI component for voice dictation
- **`speech-to-text.ts`**: Google Speech-to-Text service
- **`geminiProcessor.ts`**: Google Gemini AI processor
- **`storeAdapter.ts`**: Converts Svelte store state to LLM format
- **`actionExecutor.ts`**: Executes LLM actions on the store
- **`addressResolver.ts`**: Resolves addresses using Google Places API

### Models Used

- **Speech-to-Text**: `latest_long` model (best for longer recordings)
- **Gemini**: `gemini-1.5-flash` (fast and efficient for real-time processing)

### Browser Support

- Requires browser support for `MediaRecorder` API
- Works best in Chrome, Edge, Firefox, Safari (latest versions)
- Requires microphone permissions

## Troubleshooting

### "Microphone access denied"
- Check browser permissions for microphone access
- Make sure you've granted permission when prompted

### "No speech detected"
- Speak clearly and at a moderate pace
- Check that your microphone is working
- Try speaking closer to the microphone

### "API key not set"
- Make sure `PUBLIC_GOOGLE_AI_API_KEY` is set in `.env.local`
- Restart the dev server after adding the key

### Transcription quality issues
- Speak clearly and avoid background noise
- Use a good quality microphone
- Speak at a moderate pace (not too fast or too slow)

## Tips for Best Results

1. **Be specific**: Include client names, dates, amounts, and addresses
2. **Speak clearly**: Enunciate and avoid mumbling
3. **Include context**: Mention which client you're talking about
4. **Use natural language**: Speak as you would to a loan officer
5. **Add details gradually**: You can make multiple recordings to add more information



