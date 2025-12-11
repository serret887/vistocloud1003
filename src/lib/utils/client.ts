/**
 * Client data utilities
 * Functions for extracting and formatting client information
 */

import { t } from '$lib/i18n';
import type { ApplicationState } from '$lib/stores/application/types';

/**
 * Extracts client name from application state
 * @param store - Application store state
 * @param clientId - Client ID to get name for
 * @returns Formatted client name or fallback
 */
export function getClientNameFromStore(
	store: ApplicationState,
	clientId: string
): string {
	const client = store.clientData[clientId];
	if (client?.firstName && client?.lastName) {
		return `${client.firstName} ${client.lastName}`;
	}
	if (client?.firstName) {
		return client.firstName;
	}
	if (client?.lastName) {
		return client.lastName;
	}
	return t('applications.unnamedApplication');
}

/**
 * Extracts client name from LLM state format (used in action handlers)
 * @param store - LLM store state with clients property
 * @param clientId - Client ID to get name for
 * @returns Formatted client name or fallback
 */
export function getClientNameFromLLMState(store: any, clientId: string): string {
	const clientData = store.clients?.[clientId];
	if (clientData?.firstName && clientData?.lastName) {
		return `${clientData.firstName} ${clientData.lastName}`;
	}
	return clientData?.firstName || clientData?.lastName || 'Client';
}

/**
 * Extracts client name from application document data
 * @param app - Application document from Firebase
 * @returns Formatted client name or fallback
 */
export function getClientNameFromApp(app: any): string {
	const clientData = app.clientData || {};
	const firstClientId = Object.keys(clientData)[0];
	const client = clientData[firstClientId];
	if (client?.firstName && client?.lastName) {
		return `${client.firstName} ${client.lastName}`;
	}
	if (client?.firstName) {
		return client.firstName;
	}
	if (client?.lastName) {
		return client.lastName;
	}
	return t('applications.unnamedApplication');
}
