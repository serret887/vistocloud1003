<script lang="ts">
	import ValidatedInput from './validated-input.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { validateEmail } from '$lib/validators';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'oninput' | 'type'> {
		label?: string;
		value?: string;
		onValueChange?: (value: string) => void;
		required?: boolean;
	}

	let {
		label = 'Email Address',
		value: propValue = '',
		onValueChange,
		required = false,
		...restProps
	}: Props = $props();

	let value = $state(propValue);

	// Sync prop value changes
	$effect(() => {
		if (propValue !== value) {
			value = propValue;
		}
	});

	function validateEmailAddress(email: string): string | null {
		if (!email) {
			return required ? `${label || 'Email'} is required` : null;
		}

		const trimmed = email.trim().toLowerCase();

		// Basic format check
		if (!trimmed.includes('@')) {
			return 'Email must contain @ symbol';
		}

		// Use the validator from validators
		if (!validateEmail(trimmed)) {
			return 'Invalid email format';
		}

		// Check for common email issues
		if (trimmed.startsWith('@')) {
			return 'Email cannot start with @';
		}

		if (trimmed.endsWith('@')) {
			return 'Email cannot end with @';
		}

		const parts = trimmed.split('@');
		if (parts.length !== 2) {
			return 'Email must have exactly one @ symbol';
		}

		const [localPart, domain] = parts;

		if (!localPart || localPart.length === 0) {
			return 'Email must have a local part before @';
		}

		if (!domain || domain.length === 0) {
			return 'Email must have a domain after @';
		}

		if (!domain.includes('.')) {
			return 'Email domain must contain a dot';
		}

		// Check for consecutive dots
		if (trimmed.includes('..')) {
			return 'Email cannot contain consecutive dots';
		}

		return null; // Valid
	}

	function handleValueChange(newValue: string) {
		// Don't auto-clean while typing - let user see what they type
		value = newValue;
		onValueChange?.(newValue);
	}
	
	// Handle validation - only called on blur
	function handleValidation(email: string): string | null {
		const result = validateEmailAddress(email);
		// Clean email only after validation passes (on blur)
		// Only clean if validation passed (result is null) and email needs cleaning
		if (result === null && email) {
			const trimmed = email.trim().toLowerCase();
			if (trimmed !== email) {
				// Clean the email after blur completes
				setTimeout(() => {
					value = trimmed;
					onValueChange?.(trimmed);
				}, 100);
			}
		}
		return result;
	}
</script>

<ValidatedInput
	{label}
	value={value}
	onValueChange={handleValueChange}
	validate={handleValidation}
	{required}
	showError={true}
	type="email"
	{...restProps}
/>
