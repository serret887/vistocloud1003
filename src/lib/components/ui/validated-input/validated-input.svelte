<script lang="ts">
	import { Input, Label } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { AlertCircle } from 'lucide-svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { _ } from 'svelte-i18n';
	import { get } from 'svelte/store';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'oninput' | 'onblur'> {
		label?: string;
		value?: string;
		error?: string;
		validate?: (value: string) => string | null; // Returns error message or null if valid
		onValueChange?: (value: string) => void;
		onValidationChange?: (isValid: boolean, error: string | null) => void;
		required?: boolean;
		showError?: boolean; // Control when to show error (e.g., only after blur)
	}

	let {
		label,
		value: propValue = '',
		error: externalError,
		validate,
		onValueChange,
		onValidationChange,
		required = false,
		showError = false,
		class: className,
		id,
		...restProps
	}: Props = $props();

	let internalValue = $state(propValue);
	let internalError = $state<string | null>(null);
	let hasBlurred = $state(false);
	let inputRef: any = $state(null);

	// Sync prop value changes
	$effect(() => {
		if (propValue !== internalValue) {
			internalValue = propValue;
		}
	});

	// Use external error if provided, otherwise use internal validation
	const error = $derived(externalError || internalError);
	const showErrorMessage = $derived(hasBlurred && showError && error !== null);

	function handleInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const newValue = target.value;
		internalValue = newValue;
		onValueChange?.(newValue);
		
		// Clear error on input if it was shown (but don't validate)
		if (internalError) {
			internalError = null;
			onValidationChange?.(true, null);
		}
	}

	function handleBlur() {
		// Only validate on blur, not while typing
		hasBlurred = true;
		
		if (validate) {
			// Validate the current value
			const validationError = validate(internalValue);
			internalError = validationError;
			onValidationChange?.(validationError === null, validationError);
		} else if (required && !internalValue) {
			const translate = get(_);
			const fieldRequired = translate('errors.fieldRequired');
			internalError = label ? fieldRequired.replace('This field', label) : fieldRequired;
			onValidationChange?.(false, internalError);
		} else {
			internalError = null;
			onValidationChange?.(true, null);
		}
	}

	const inputId = $derived(id || `input-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="space-y-2">
	{#if label}
		<Label for={inputId} class={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
			{label}
		</Label>
	{/if}
	
	<div class="relative">
		<Input
			bind:this={inputRef}
			id={inputId}
			value={internalValue}
			oninput={handleInput}
			onblur={handleBlur}
			class={cn(
				showErrorMessage && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
				className
			)}
			aria-invalid={showErrorMessage}
			aria-describedby={showErrorMessage ? `${inputId}-error` : undefined}
			type={restProps.type as any}
			placeholder={restProps.placeholder}
			disabled={restProps.disabled}
			readonly={restProps.readonly}
			maxlength={restProps.maxlength}
		/>
		{#if showErrorMessage}
			<AlertCircle class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
		{/if}
	</div>
	
	{#if showErrorMessage}
		<p id="{inputId}-error" class="text-sm text-destructive flex items-center gap-1" role="alert">
			<AlertCircle class="h-3 w-3" />
			{error}
		</p>
	{/if}
</div>
