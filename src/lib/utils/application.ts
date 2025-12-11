/**
 * Application creation utilities
 * Centralized functions for creating applications with proper error handling and navigation
 */

import { applicationStore } from '$lib/stores/application/index';
import { goto } from '$app/navigation';
import { toast } from 'svelte-sonner';
import { t } from '$lib/i18n';

/**
 * Creates a new application with proper error handling, toast notifications, and navigation
 * @returns Promise that resolves with the application ID, or rejects on error
 */
export async function createNewApplication(): Promise<string> {
	try {
		const id = await applicationStore.createApplication();
		toast.success(t('toast.applicationCreated'), {
			description: t('toast.applicationCreatedDescription')
		});
		goto(`/application/${id}/client-info`);
		return id;
	} catch (error) {
		toast.error(t('toast.applicationCreateFailed'), {
			description:
				error instanceof Error
					? error.message
					: t('toast.applicationCreateFailedDescription')
		});
		throw error;
	}
}
