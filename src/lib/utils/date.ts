/**
 * Date formatting utilities
 * Centralized date formatting functions
 */

import { t } from '$lib/i18n';

/**
 * Formats a date value (Firebase Timestamp, string, or Date) to a localized date string
 * @param date - Date value to format (can be Firebase Timestamp, string, or Date)
 * @returns Formatted date string or 'N/A' if invalid
 */
export function formatDate(date: any): string {
	if (!date) return t('common.na');
	
	// Handle Firebase Timestamp
	if (date.toDate && typeof date.toDate === 'function') {
		return date.toDate().toLocaleDateString();
	}
	
	// Handle string dates
	if (typeof date === 'string') {
		const parsed = new Date(date);
		if (!isNaN(parsed.getTime())) {
			return parsed.toLocaleDateString();
		}
	}
	
	// Handle Date objects
	if (date instanceof Date) {
		return date.toLocaleDateString();
	}
	
	return t('common.na');
}
