<script lang="ts">
	import ValidatedInput from './validated-input.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'oninput' | 'type'> {
		label?: string;
		value?: string;
		onValueChange?: (value: string) => void;
		required?: boolean;
	}

	let {
		label = 'Social Security Number',
		value = $bindable(''),
		onValueChange,
		required = false,
		...restProps
	}: Props = $props();
	
	// Internal value for formatting
	let internalValue = $state(value);
	
	// Sync external value changes
	$effect(() => {
		if (value !== internalValue) {
			internalValue = value;
		}
	});

	function formatSSN(input: string): string {
		// Remove all non-digits
		const digits = input.replace(/\D/g, '');
		
		// Limit to 9 digits
		const limited = digits.slice(0, 9);
		
		// Format as XXX-XX-XXXX
		if (limited.length <= 3) {
			return limited;
		} else if (limited.length <= 5) {
			return `${limited.slice(0, 3)}-${limited.slice(3)}`;
		} else {
			return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
		}
	}

	function validateSSN(ssn: string): string | null {
		if (!ssn) {
			return required ? 'SSN is required' : null;
		}

		// Remove formatting
		const digits = ssn.replace(/\D/g, '');
		
		// Check length
		if (digits.length !== 9) {
			return 'SSN must be 9 digits';
		}

		// Check for invalid patterns
		const areaNumber = digits.slice(0, 3);
		const groupNumber = digits.slice(3, 5);
		const serialNumber = digits.slice(5);

		// Invalid area numbers
		if (areaNumber === '000' || areaNumber === '666' || areaNumber.startsWith('9')) {
			return 'Invalid SSN: area number is not valid';
		}

		// Invalid group numbers
		if (groupNumber === '00') {
			return 'Invalid SSN: group number is not valid';
		}

		// Invalid serial numbers
		if (serialNumber === '0000') {
			return 'Invalid SSN: serial number is not valid';
		}

		return null; // Valid
	}

	function handleInput(val: string) {
		const formatted = formatSSN(val);
		internalValue = formatted;
		value = formatted;
		onValueChange?.(formatted);
	}
</script>

<ValidatedInput
	{label}
	value={internalValue}
	onValueChange={handleInput}
	validate={validateSSN}
	{required}
	showError={true}
	placeholder="XXX-XX-XXXX"
	maxlength={11}
	{...restProps}
/>

