import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';

// Dev-only mock session so protected routes render locally.
// Swap to real auth/session wiring when available.
export const handle: Handle = async ({ event, resolve }) => {
	if (dev && !event.locals.user) {
		event.locals.user = {
			uid: 'dev-user',
			email: 'dev@example.com',
			name: 'Dev User',
			orgId: 'dev-org'
		};
		event.locals.org = {
			id: 'dev-org',
			name: 'Dev Org',
			plan: 'free',
			createdAt: new Date()
		};
	}

	event.locals.user = event.locals.user ?? null;
	event.locals.org = event.locals.org ?? null;
	return resolve(event);
};

