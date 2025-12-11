# Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Firebase login: `firebase login`

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your values (especially Google Maps API key if using address autocomplete)

## Running with Firebase Emulator

### Option 1: Run Both Together (Recommended)
```bash
npm run dev:emulator
```

This starts:
- Firebase Emulator (Firestore on port 8080, UI on port 4000)
- SvelteKit dev server (on port 5173)

### Option 2: Run Separately

**Terminal 1 - Start Firebase Emulator:**
```bash
npm run emulators:start
```

**Terminal 2 - Start SvelteKit:**
```bash
npm run dev
```

## Access Points

- **Application**: http://localhost:5173
- **Firebase Emulator UI**: http://localhost:4000
- **Firestore Emulator**: localhost:8080

## Verify Emulator Connection

1. Open browser console
2. Look for: `🔥 Connected to Firestore Emulator at localhost:8080`
3. Open Firebase Emulator UI at http://localhost:4000
4. Create an application - it should appear in the `applications` collection

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests with UI:
```bash
npm run test:ui
```

### Run tests in headed mode:
```bash
npm run test:headed
```

## Troubleshooting

### Data not saving to emulator

1. Check `.env` has `VITE_USE_FIREBASE_EMULATOR=true`
2. Verify emulator is running: `firebase emulators:start`
3. Check browser console for connection message
4. Verify emulator UI shows data at http://localhost:4000

### Application not rendering

1. Check browser console for errors
2. Verify all dependencies installed: `npm install`
3. Check TypeScript errors: `npm run check`
4. Verify store is initialized (check console logs)

### Select components not working

1. Clear browser cache
2. Restart dev server
3. Check browser console for errors




