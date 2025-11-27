# VistoCloud - Mortgage Application Platform

A modern mortgage application processing platform built with **SvelteKit** and **Firebase**.

## Tech Stack

- **Frontend**: SvelteKit 2 with Svelte 5
- **Styling**: Tailwind CSS 4 with shadcn-svelte style components
- **Backend**: Firebase (Firestore)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Emulator (Optional)

For local development with Firebase emulators:

```bash
# Start emulators
npm run emulators:start

# Or run dev server with emulators
npm run dev:emulator
```

## Project Structure

```
src/
├── lib/
│   ├── components/       # Svelte components
│   │   ├── steps/        # Application step components
│   │   └── ui/           # UI primitives (shadcn-svelte style)
│   ├── stores/           # Svelte stores
│   ├── types/            # TypeScript type definitions
│   ├── conditions/       # Loan condition generators
│   ├── llm/              # LLM processing utilities
│   └── firebase.ts       # Firebase configuration
├── routes/               # SvelteKit routes
│   ├── +page.svelte      # Home page
│   └── application/      # Application form routes
└── app.css               # Global styles
```

## Features

- **Multi-step Application Form**: Client info, employment, income, assets, real estate, documents
- **Multi-Client Support**: Handle primary borrowers and co-borrowers
- **Svelte Stores**: Reactive state management
- **Firebase Integration**: Real-time data persistence
- **Voice Assistant**: AI-powered voice dictation (coming soon)
- **Document Upload**: Secure document management (coming soon)

## Environment Variables

Create a `.env` file for custom configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_USE_FIREBASE_EMULATOR=true
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check the project
- `npm run emulators` - Start Firebase emulators

## License

Private - All rights reserved
