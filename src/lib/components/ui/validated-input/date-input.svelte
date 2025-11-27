<script lang="ts">
	import ValidatedInput from './validated-input.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'oninput' | 'type'> {
		label?: string;
		value?: string;
		onValueChange?: (value: string) => void;
		required?: boolean;
		allowFuture?: boolean; // If false, future dates are invalid
		maxDate?: string; // ISO date string for maximum allowed date
		minDate?: string; // ISO date string for minimum allowed date
	}

	let {
		label,
		value: propValue = '',
		onValueChange,
		required = false,
		allowFuture = false,
		maxDate,
		minDate,
		...restProps
	}: Props = $props();
	
	let value = $state(propValue);
	
	// Sync prop value changes
	$effect(() => {
		if (propValue !== value) {
			value = propValue;
		}
	});
	
	// Update parent when value changes
	function handleValueChange(newValue: string) {
		value = newValue;
		onValueChange?.(newValue);
	}

	function validateDate(dateStr: string): string | null {
		if (!dateStr) {
			return required ? `${label || 'Date'} is required` : null;
		}

		const date = new Date(dateStr);
		const today = new Date();
		today.setHours(23, 59, 59, 999); // End of today

		// Check if valid date
		if (isNaN(date.getTime())) {
			return 'Invalid date';
		}

		// Check future date
		if (!allowFuture && date > today) {
			return 'Date cannot be in the future';
		}

		// Check max date
		if (maxDate) {
			const max = new Date(maxDate);
			if (date > max) {
				return `Date cannot be after ${new Date(maxDate).toLocaleDateString()}`;
			}
		}

		// Check min date
		if (minDate) {
			const min = new Date(minDate);
			if (date < min) {
				return `Date cannot be before ${new Date(minDate).toLocaleDateString()}`;
			}
		}

		// Special validation for Date of Birth: must be at least 18 years old
		if (label?.toLowerCase().includes('birth') || label?.toLowerCase().includes('dob')) {
			const eighteenYearsAgo = new Date();
			eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
			eighteenYearsAgo.setHours(23, 59, 59, 999);
			
			if (date > eighteenYearsAgo) {
				return 'Must be at least 18 years old to apply for a mortgage';
			}
		}

		return null; // Valid
	}
</script>

<ValidatedInput
	{label}
	value={value}
	onValueChange={handleValueChange}
	validate={validateDate}
	{required}
	showError={true}
	type="date"
	{...restProps}
/>

