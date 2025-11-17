# Firebase Emulator Setup Guide

This project is configured to use Firebase Emulator for local development and testing.

## Prerequisites

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase (if not already):
   ```bash
   firebase login
   ```

## Configuration

### Environment Variables

The project uses environment variables to control Firebase emulator connection. Update `.env.local`:

```bash
# Enable Firebase Emulator
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=localhost
NEXT_PUBLIC_FIREBASE_EMULATOR_PORT=8080
```

### To Use Production Firebase

Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false` in `.env.local` or remove the variable.

## Running the Application with Emulator

### Option 1: Run Separately (Recommended)

**Terminal 1 - Start Firebase Emulator:**
```bash
npm run emulators:start
```

**Terminal 2 - Start Next.js:**
```bash
npm run dev
```

### Option 2: Run All Emulators

```bash
npm run emulators
```

This starts all configured emulators (Firestore, UI, etc.)

## Access Points

- **Next.js App**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000
- **Firestore Emulator**: localhost:8080

## Emulator Data Persistence

### Export Emulator Data

To save your emulator data:
```bash
npm run emulators:export
```

This exports data to `./emulator-data/` directory.

### Import Emulator Data

To start emulator with existing data:
```bash
npm run emulators:import
```

This imports from `./emulator-data/` and exports on exit.

## Verification

1. Check browser console for: `🔥 Connected to Firestore Emulator at localhost:8080`
2. Open Emulator UI at http://localhost:4000
3. Create an application - it should appear in the emulator UI

## Troubleshooting

### Emulator Not Connecting

1. **Check if emulator is running:**
   ```bash
   firebase emulators:start
   ```

2. **Verify environment variables:**
   - Check `.env.local` has `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`
   - Restart Next.js dev server after changing env vars

3. **Check ports:**
   - Firestore: 8080
   - UI: 4000
   - If ports are in use, update `firebase.json` and `.env.local`

### Port Already in Use

If port 8080 or 4000 is already in use:

1. Update `firebase.json`:
   ```json
   "emulators": {
     "firestore": {
       "port": 8081
     },
     "ui": {
       "port": 4001
     }
   }
   ```

2. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_FIREBASE_EMULATOR_PORT=8081
   ```

### Production Build

The emulator is **automatically disabled** in production builds (`NODE_ENV === 'production'`). The app will connect to production Firebase.

## Firestore Rules

Firestore rules are located in `firestore.rules` and are automatically loaded by the emulator.

## Indexes

Firestore indexes are defined in `firestore.indexes.json` and are used by both emulator and production.

