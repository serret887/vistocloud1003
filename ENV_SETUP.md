# Environment Variables Setup

## SvelteKit Environment Variables

SvelteKit uses Vite for environment variable loading. Here's how it works:

### Important Rules:

1. **Client-side variables MUST be prefixed with `VITE_`**
   - Only variables starting with `VITE_` are exposed to client-side code
   - Variables without `VITE_` are only available in server-side code

2. **File Priority (highest to lowest):**
   - `.env.local` (highest priority, should be in .gitignore)
   - `.env` (committed to repo, can have defaults)
   - `.env.production` / `.env.development` (environment-specific)

3. **Access in Code:**
   - Client-side: `import.meta.env.VITE_*`
   - Server-side: `import.meta.env.*` (any variable)

4. **Restart Required:**
   - After changing `.env` files, you MUST restart the dev server
   - Environment variables are loaded at build/start time

### Current Environment Variables:

#### Firebase Configuration:
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

#### Firebase Emulator:
```bash
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_EMULATOR_HOST=localhost
VITE_FIREBASE_EMULATOR_PORT=8080
```

#### Google Maps API:
```bash
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

#### Debug Mode:
```bash
VITE_DEBUG=true
```

### Troubleshooting:

1. **Variables not loading?**
   - Check they start with `VITE_` for client-side
   - Restart the dev server: `npm run dev`
   - Check browser console for `import.meta.env` values

2. **Wrong prefix?**
   - SvelteKit uses `VITE_`, NOT `NEXT_VITE_` (that's Next.js)
   - Make sure `.env.local` uses `VITE_` prefix

3. **Server-side only variables:**
   - Don't use `VITE_` prefix
   - Access via `import.meta.env.VARIABLE_NAME`
   - Only available in `+page.server.ts`, `+layout.server.ts`, API routes, etc.

