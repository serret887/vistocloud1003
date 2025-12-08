import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';
import { get } from 'svelte/store';
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

register('en', () => import('./locales/en.json'));
register('es', () => import('./locales/es.json'));

// Get saved locale from localStorage or use navigator language
function getInitialLocale(): string {
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('locale');
		if (saved === 'en' || saved === 'es') {
			return saved;
		}
		const navLocale = getLocaleFromNavigator();
		if (navLocale?.startsWith('es')) {
			return 'es';
		}
	}
	return 'en';
}

init({
	fallbackLocale: 'en',
	initialLocale: getInitialLocale(),
});

// Export function to change locale
export function setLocale(newLocale: 'en' | 'es') {
	locale.set(newLocale);
	if (typeof window !== 'undefined') {
		localStorage.setItem('locale', newLocale);
	}
}

// Export current locale as readable store
export { locale };

// Helper function to get translations in non-Svelte files (like validation)
export function t(key: string, values?: Record<string, string | number>): string {
	try {
		const currentLocale = get(locale) || 'en';
		const translations = currentLocale === 'es' ? esTranslations : enTranslations;
		
		// Navigate through nested keys (e.g., "errors.firstNameRequired")
		const keys = key.split('.');
		let value: any = translations;
		for (const k of keys) {
			value = value?.[k];
			if (value === undefined) break;
		}
		
		if (typeof value !== 'string') {
			// Fallback to English if translation not found
			const enValue: any = enTranslations;
			let fallback = enValue;
			for (const k of keys) {
				fallback = fallback?.[k];
				if (fallback === undefined) break;
			}
			value = typeof fallback === 'string' ? fallback : key;
		}
		
		// Replace placeholders with values
		if (values) {
			return value.replace(/\{(\w+)\}/g, (match: string, placeholder: string) => {
				return values[placeholder]?.toString() || match;
			});
		}
		
		return value;
	} catch (error) {
		console.warn(`Translation error for key: ${key}`, error);
		return key;
	}
}

