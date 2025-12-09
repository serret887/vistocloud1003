// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: {
				uid: string;
				email?: string;
				name?: string;
				orgId?: string | null;
			} | null;
			org: {
				id: string;
				name?: string;
				plan?: string;
				createdAt?: Date;
			} | null;
		}
	}
}

export {};
