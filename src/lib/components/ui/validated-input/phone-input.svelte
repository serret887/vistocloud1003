<script lang="ts">
	import ValidatedInput from './validated-input.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { validateUSPhone, formatUSPhone } from '$lib/validators';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'oninput' | 'type'> {
		label?: string;
		value?: string;
		onValueChange?: (value: string) => void;
		required?: boolean;
	}

	let {
		label = 'Phone Number',
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

	function formatPhone(input: string): string {
		// Remove all non-digits
		const digits = input.replace(/\D/g, '');
		
		// Limit to 10 digits (US phone number)
		const limited = digits.slice(0, 10);
		
		// Format as (XXX) XXX-XXXX
		if (limited.length === 0) {
			return '';
		} else if (limited.length <= 3) {
			return `(${limited}`;
		} else if (limited.length <= 6) {
			return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
		} else {
			return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
		}
	}

	function validatePhoneNumber(phone: string): string | null {
		if (!phone) {
			return required ? `${label || 'Phone number'} is required` : null;
		}

		// Remove formatting
		const digits = phone.replace(/\D/g, '');

		// Check length
		if (digits.length < 10) {
			return 'Phone number must be 10 digits';
		}

		if (digits.length > 10) {
			return 'Phone number cannot exceed 10 digits';
		}

		// Use the validator from validators
		if (!validateUSPhone(phone)) {
			return 'Invalid phone number format';
		}

		// Check for invalid patterns (all same digit, etc.)
		if (/^(\d)\1{9}$/.test(digits)) {
			return 'Phone number cannot be all the same digit';
		}

		return null; // Valid
	}

	function handleValueChange(newValue: string) {
		// Format phone as user types
		const formatted = formatPhone(newValue);
		value = formatted;
		onValueChange?.(formatted);
	}
</script>

<ValidatedInput
	{label}
	value={value}
	onValueChange={handleValueChange}
	validate={validatePhoneNumber}
	{required}
	showError={true}
	type="tel"
	placeholder="(555) 123-4567"
	maxlength={14}
	{...restProps}
/>

