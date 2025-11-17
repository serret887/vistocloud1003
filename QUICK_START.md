# Quick Start Guide

## To run with Firebase Emulator:

### Option 1: Run Both Together (Recommended)
```bash
npm run dev:emulator
```
This starts both Firebase Emulator and Next.js in one command.

### Option 2: Run Separately

1. Start Firebase Emulator (Terminal 1):
   ```bash
   npm run emulators:start
   ```

2. Start Next.js (Terminal 2):
   ```bash
   npm run dev
   ```

3. Open browser:
   - App: http://localhost:3000
   - Emulator UI: http://localhost:4000

## Environment Variables

Check `.env.local` - it should have:
- NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true

## To use Production Firebase

Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false` in `.env.local`

See FIREBASE_EMULATOR_SETUP.md for detailed instructions.

