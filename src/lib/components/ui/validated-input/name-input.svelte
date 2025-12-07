<script lang="ts">
	import ValidatedInput from './validated-input.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'oninput' | 'type'> {
		label?: string;
		value?: string;
		onValueChange?: (value: string) => void;
		required?: boolean;
		allowSpaces?: boolean; // Allow spaces (for full names) or not (for single names)
	}

	let {
		label,
		value: propValue = '',
		onValueChange,
		required = false,
		allowSpaces = true,
		...restProps
	}: Props = $props();

	let value = $state(propValue);

	// Sync prop value changes
	$effect(() => {
		if (propValue !== value) {
			value = propValue;
		}
	});

	function validateName(name: string): string | null {
		if (!name) {
			return required ? `${label || 'Name'} is required` : null;
		}

		const trimmed = name.trim();

		// Check for digits
		if (/\d/.test(trimmed)) {
			return 'Name cannot contain numbers';
		}

		// Check for special characters (allow apostrophes and hyphens for names like O'Brien, Mary-Jane)
		if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
			return 'Name can only contain letters, spaces, apostrophes, and hyphens';
		}

		// Check minimum length
		if (trimmed.length < 2) {
			return 'Name must be at least 2 characters';
		}

		// Check maximum length
		if (trimmed.length > 50) {
			return 'Name cannot exceed 50 characters';
		}

		// If spaces not allowed, check for spaces
		if (!allowSpaces && /\s/.test(trimmed)) {
			return 'Name cannot contain spaces';
		}

		return null; // Valid
	}

	function handleValueChange(newValue: string) {
		// Remove digits as user types
		const cleaned = newValue.replace(/\d/g, '');
		value = cleaned;
		onValueChange?.(cleaned);
	}
</script>

<ValidatedInput
	{label}
	value={value}
	onValueChange={handleValueChange}
	validate={validateName}
	{required}
	showError={true}
	{...restProps}
/>



