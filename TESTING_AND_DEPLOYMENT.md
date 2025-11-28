# Testing and Deployment Guide for Firebase Functions

This guide covers how to test your Firebase functions locally and deploy them to production.

## Prerequisites

1. ✅ Firebase CLI installed (`firebase --version`)
2. ✅ Logged into Firebase (`firebase login`)
3. ✅ Project configured (`.firebaserc` points to `vistocloud`)
4. ✅ Functions built (`npm run build` in `functions/` directory)

## Part 1: Local Testing with Emulators

### Step 1: Set Up Environment Variables for Local Testing

Create a `.env` file in the `functions/` directory:

```bash
cd functions
cat > .env << EOF
# Required: Google AI API Key for Speech-to-Text and Gemini
GOOGLE_AI_API_KEY=your-api-key-here

# Optional: Model Configuration Overrides
AI_PROVIDER=vertexExpress  # Options: 'vertex', 'vertexExpress', 'googleAI'
AI_MODEL=gemini-1.5-flash  # Options: 'gemini-1.5-flash', 'gemini-1.5-pro', etc.
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=4000
VERTEX_AI_LOCATION=global
EOF
```

**Get your API key:**
- For Google AI (Gemini Developer API): https://aistudio.google.com/app/apikey
- For Vertex AI Express Mode: Use the same API key from Google AI Studio

### Step 2: Build the Functions

```bash
cd functions
npm run build
```

### Step 3: Start the Emulators

From the project root:

```bash
# Start all emulators (Firestore, Auth, Functions, UI)
npm run emulators:start

# Or start only functions emulator
cd functions
npm run serve
```

The emulator UI will be available at: **http://localhost:4000**

### Step 4: Test Functions Locally

#### Option A: Test via Your Application

1. Make sure your app is configured to use emulators (check `.env` in project root):
   ```bash
   VITE_USE_FIREBASE_EMULATOR=true
   VITE_FIREBASE_EMULATOR_HOST=localhost
   VITE_FIREBASE_EMULATOR_PORT=8080
   VITE_FIREBASE_FUNCTIONS_PORT=5001
   ```

2. Start your dev server:
   ```bash
   npm run dev
   ```

3. Use the voice dictation feature in your app - it will call the functions through the emulator.

#### Option B: Test via Emulator UI

1. Open http://localhost:4000
2. Navigate to "Functions" tab
3. Click on a function name
4. Use the "Test function" feature with sample data

#### Option C: Test via Firebase CLI

```bash
# Test transcribeAudio function
firebase functions:shell
# Then in the shell:
transcribeAudio({audioBase64: "base64-encoded-audio", mimeType: "audio/webm"})
```

#### Option D: Test via cURL

```bash
# Test transcribeAudio
curl -X POST http://localhost:5001/vistocloud/us-central1/transcribeAudio \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "audioBase64": "data:audio/webm;base64,...",
      "mimeType": "audio/webm"
    }
  }'

# Test processConversation
curl -X POST http://localhost:5001/vistocloud/us-central1/processConversation \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "transcription": "My name is John Doe",
      "currentState": {},
      "conversationHistory": []
    }
  }'
```

### Step 5: Verify Function Logs

Check the emulator console output for:
- ✅ Function initialization messages
- ✅ Successful function calls
- ✅ Any error messages

Look for:
```
✔  functions: Loaded functions definitions from source: transcribeAudio, processConversation.
✔  functions[us-central1-transcribeAudio]: http function initialized
✔  functions[us-central1-processConversation]: http function initialized
```

## Part 2: Production Deployment

### Step 1: Set Up Secrets in Firebase Secret Manager

**IMPORTANT:** Never commit API keys to your repository. Use Firebase Secret Manager for production.

```bash
# Set the Google AI API key as a secret
firebase functions:secrets:set GOOGLE_AI_API_KEY

# When prompted, paste your API key
# The secret will be automatically available to your functions
```

Verify the secret was set:
```bash
firebase functions:secrets:access GOOGLE_AI_API_KEY
```

### Step 2: Verify Build

Make sure functions are built and there are no TypeScript errors:

```bash
cd functions
npm run build
npm run lint  # Optional: check for linting issues
```

### Step 3: Deploy Functions

#### Deploy All Functions

```bash
# From project root
firebase deploy --only functions

# Or from functions directory
cd functions
npm run deploy
```

#### Deploy Specific Functions

```bash
# Deploy only transcribeAudio
firebase deploy --only functions:transcribeAudio

# Deploy only processConversation
firebase deploy --only functions:processConversation
```

#### Deploy Specific Codebase

```bash
# Deploy only the default codebase (your main functions)
firebase deploy --only functions:default
```

### Step 4: Verify Deployment

After deployment, you'll see output like:

```
✔  functions[us-central1-transcribeAudio(us-central1)] Successful create operation.
✔  functions[us-central1-processConversation(us-central1)] Successful create operation.
```

#### Check Function URLs

Your functions will be available at:
- `https://us-central1-vistocloud.cloudfunctions.net/transcribeAudio`
- `https://us-central1-vistocloud.cloudfunctions.net/processConversation`

#### View Function Logs

```bash
# View recent logs
firebase functions:log

# View logs for specific function
firebase functions:log --only transcribeAudio

# Follow logs in real-time
firebase functions:log --follow
```

### Step 5: Test Production Functions

#### Update Your App Configuration

For production, make sure your app is **NOT** using emulators:

```bash
# In .env (project root) - either remove or set to false
VITE_USE_FIREBASE_EMULATOR=false
```

#### Test via Your Application

1. Deploy your frontend (if needed)
2. Use the voice dictation feature
3. Check browser console for function calls
4. Verify functions are working correctly

#### Test via Firebase Console

1. Go to https://console.firebase.google.com/project/vistocloud/functions
2. Click on a function
3. Use the "Test function" feature

## Troubleshooting

### Functions Not Working in Emulator

1. **Check emulator is running:**
   ```bash
   lsof -ti:5001 && echo "Functions emulator running" || echo "Not running"
   ```

2. **Verify .env file exists:**
   ```bash
   cd functions
   test -f .env && echo "✅ .env exists" || echo "❌ .env missing"
   ```

3. **Check function logs in emulator console**

4. **Verify functions are built:**
   ```bash
   cd functions
   test -d lib && echo "✅ Built" || echo "❌ Not built - run npm run build"
   ```

### Functions Not Working in Production

1. **Check secrets are set:**
   ```bash
   firebase functions:secrets:access GOOGLE_AI_API_KEY
   ```

2. **Check function logs:**
   ```bash
   firebase functions:log --only transcribeAudio
   ```

3. **Verify function URLs are correct**

4. **Check billing is enabled** (required for Cloud Functions)

### API Key Errors

- **Local:** Make sure `GOOGLE_AI_API_KEY` is in `functions/.env`
- **Production:** Make sure secret is set: `firebase functions:secrets:set GOOGLE_AI_API_KEY`

### Build Errors

```bash
cd functions
npm run build
# Fix any TypeScript errors shown
```

### Deployment Errors

1. **Check Firebase login:**
   ```bash
   firebase login:list
   ```

2. **Verify project:**
   ```bash
   firebase use
   ```

3. **Check billing:**
   - Go to Firebase Console → Project Settings → Usage and billing
   - Ensure billing is enabled

## Quick Reference Commands

```bash
# Local Testing
npm run emulators:start              # Start all emulators
cd functions && npm run serve       # Start only functions emulator
cd functions && npm run build       # Build functions

# Deployment
firebase deploy --only functions    # Deploy all functions
firebase functions:log              # View logs
firebase functions:secrets:set      # Set secrets

# Verification
firebase functions:list             # List deployed functions
firebase use                        # Check current project
```

## Next Steps After Deployment

1. ✅ Monitor function usage in Firebase Console
2. ✅ Set up alerts for function errors
3. ✅ Review function logs regularly
4. ✅ Update secrets if API keys change
5. ✅ Test production functions thoroughly

## Security Checklist

- [ ] API keys stored in Secret Manager (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] Functions have proper CORS configuration
- [ ] Functions have appropriate `maxInstances` limits
- [ ] Secrets are not logged or exposed

