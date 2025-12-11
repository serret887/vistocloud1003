import { writable } from 'svelte/store';
import type { Program } from '$lib/ai/types';

export const selectedConversationId = writable<string | null>(null);
export const selectedPrograms = writable<Program[]>(['ALL']);
export const selectedLenderIds = writable<string[]>([]);
export const compareMode = writable(false);
export const isSendingMessage = writable(false);


