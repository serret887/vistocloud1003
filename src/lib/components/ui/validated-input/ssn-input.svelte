<script lang="ts">
	import ValidatedInput from './validated-input.svelte';
	import { Button } from '$lib/components/ui';
	import { Eye, EyeOff } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { _ } from 'svelte-i18n';

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
		class: className,
		id,
		...restProps
	}: Props = $props();
	
	// Internal value for formatting - always stores the actual SSN
	let internalValue = $state(value);
	let isVisible = $state(false);
	let containerRef: HTMLDivElement | null = $state(null);
	let inputElement: HTMLInputElement | null = $state(null);
	let buttonRef = $state<HTMLElement | null>(null);
	
	// Sync external value changes
	$effect(() => {
		if (value !== internalValue) {
			internalValue = value;
		}
	});

	// Find the input element within the ValidatedInput
	$effect(() => {
		if (containerRef) {
			const input = containerRef.querySelector('input') as HTMLInputElement | null;
			if (input) {
				inputElement = input;
				// Add focus handler to auto-reveal
				input.addEventListener('focus', handleFocus);
				// Add padding to make room for the button
				const inputContainer = input.parentElement as HTMLElement | null;
				if (inputContainer && inputContainer.classList.contains('relative')) {
					inputContainer.style.paddingRight = '2.5rem';
				}
				return () => {
					input.removeEventListener('focus', handleFocus);
					if (inputContainer && inputContainer.classList.contains('relative')) {
						inputContainer.style.paddingRight = '';
					}
				};
			}
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

	function maskSSN(ssn: string): string {
		if (!ssn) return '';
		const digits = ssn.replace(/\D/g, '');
		if (digits.length !== 9) return ssn;
		return `***-**-${digits.slice(-4)}`;
	}

	function validateSSN(ssn: string): string | null {
		if (!ssn) {
			return required ? $_('errors.ssnRequired') : null;
		}

		// Remove formatting
		const digits = ssn.replace(/\D/g, '');
		
		// Check length
		if (digits.length !== 9) {
			return $_('errors.ssnMustBe9Digits');
		}

		// Check for invalid patterns
		const areaNumber = digits.slice(0, 3);
		const groupNumber = digits.slice(3, 5);
		const serialNumber = digits.slice(5);

		// Invalid area numbers
		if (areaNumber === '000' || areaNumber === '666' || areaNumber.startsWith('9')) {
			return $_('errors.ssnInvalidAreaNumber');
		}

		// Invalid group numbers
		if (groupNumber === '00') {
			return $_('errors.ssnInvalidGroupNumber');
		}

		// Invalid serial numbers
		if (serialNumber === '0000') {
			return $_('errors.ssnInvalidSerialNumber');
		}

		return null; // Valid
	}

	function handleInput(val: string) {
		const formatted = formatSSN(val);
		internalValue = formatted;
		value = formatted;
		onValueChange?.(formatted);
	}

	function handleFocus() {
		// Automatically show the SSN when user focuses on the input
		if (!isVisible && internalValue) {
			isVisible = true;
			// Update the input value to show the actual SSN
			if (inputElement) {
				setTimeout(() => {
					if (inputElement) {
						inputElement.value = internalValue;
						// Move cursor to end
						inputElement.setSelectionRange(internalValue.length, internalValue.length);
					}
				}, 0);
			}
		}
	}

	function toggleVisibility() {
		isVisible = !isVisible;
		// If making visible, focus the input
		if (isVisible && inputElement) {
			inputElement.focus();
		}
	}

	// Display value: show masked version when not visible and has value, otherwise show actual value
	const displayValue = $derived(
		!isVisible && internalValue ? maskSSN(internalValue) : internalValue
	);
</script>

<div bind:this={containerRef} class="relative">
	<ValidatedInput
		{label}
		value={displayValue}
		onValueChange={handleInput}
		validate={validateSSN}
		{required}
		showError={true}
		placeholder="XXX-XX-XXXX"
		maxlength={11}
		class={className}
		{id}
		{...restProps}
	/>
	{#if internalValue}
		<Button
			bind:ref={buttonRef}
			type="button"
			variant="ghost"
			size="icon-sm"
			class="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground z-10"
			onclick={toggleVisibility}
			aria-label={isVisible ? 'Hide SSN' : 'Show SSN'}
			style="margin-top: {label ? '1.5rem' : '0'};"
		>
			{#if isVisible}
				<EyeOff class="h-4 w-4" />
			{:else}
				<Eye class="h-4 w-4" />
			{/if}
		</Button>
	{/if}
</div>

