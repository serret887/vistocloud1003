<script lang="ts">
	import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '$lib/components/ui';
	import { Label } from '$lib/components/ui';
	import { cn } from '$lib/utils';
	import { AlertCircle } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		value?: string | undefined;
		error?: string;
		validate?: (value: string | undefined) => string | null; // Returns error message or null if valid
		onValueChange?: (value: string | undefined) => void;
		onValidationChange?: (isValid: boolean, error: string | null) => void;
		required?: boolean;
		showError?: boolean; // Control when to show error (e.g., only after blur)
		placeholder?: string;
		options: Array<{ value: string; label: string }>;
		children?: Snippet;
		class?: string;
	}

	let {
		label,
		value: propValue = undefined,
		error: externalError,
		validate,
		onValueChange,
		onValidationChange,
		required = false,
		showError = false,
		placeholder = 'Select...',
		options,
		children,
		class: className
	}: Props = $props();

	let internalValue = $state(propValue);
	let internalError = $state<string | null>(null);
	let hasBlurred = $state(false);
	let selectRef: any = $state(null);

	// Sync prop value changes
	$effect(() => {
		if (propValue !== internalValue) {
			internalValue = propValue;
		}
	});

	// Use external error if provided, otherwise use internal validation
	const error = $derived(externalError || internalError);
	// Show error if external error is provided (from step validation) OR if internal validation shows error
	const showErrorMessage = $derived((externalError || (hasBlurred && showError && internalError)) && error !== null);

	function handleValueChange(newValue: string | undefined) {
		console.log(`📝 [VALIDATED-SELECT] Value changed for "${label}":`, newValue);
		internalValue = newValue;
		onValueChange?.(newValue);
		console.log(`📝 [VALIDATED-SELECT] onValueChange called for "${label}" with:`, newValue);
		
		// Clear error on value change if it was shown
		if (internalError) {
			internalError = null;
			onValidationChange?.(true, null);
		}
	}

	function handleBlur() {
		hasBlurred = true;
		
		if (validate && internalValue) {
			const validationError = validate(internalValue);
			internalError = validationError;
			onValidationChange?.(validationError === null, validationError);
		} else if (required && !internalValue) {
			internalError = `${label || 'This field'} is required`;
			onValidationChange?.(false, internalError);
		} else {
			internalError = null;
			onValidationChange?.(true, null);
		}
	}

	// Get label for current value
	function getValueLabel(val: string | undefined): string | undefined {
		if (!val) return undefined;
		return options.find(opt => opt.value === val)?.label;
	}

	const selectId = $derived(`select-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="space-y-2">
	{#if label}
		<Label for={selectId} class={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
			{label}
		</Label>
	{/if}
	
	<div class="relative">
		<Select
			bind:this={selectRef}
			type="single"
			value={internalValue}
			onValueChange={handleValueChange}
			onOpenChange={(open) => {
				// Trigger validation when select closes (blur equivalent)
				if (!open && hasBlurred) {
					handleBlur();
				}
			}}
		>
			<SelectTrigger 
				class={cn(
					"w-full",
					showErrorMessage && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
					className
				)}
			aria-invalid={showErrorMessage ? true : undefined}
			aria-describedby={showErrorMessage ? `${selectId}-error` : undefined}
			>
				<SelectValue 
					{placeholder}
					value={getValueLabel(internalValue)}
				/>
			</SelectTrigger>
			<SelectContent>
				{#if children}
					{@render children()}
				{:else}
					{#each options as option}
						<SelectItem value={option.value}>{option.label}</SelectItem>
					{/each}
				{/if}
			</SelectContent>
		</Select>
		{#if showErrorMessage}
			<AlertCircle class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
		{/if}
	</div>
	
	{#if showErrorMessage}
		<p id="{selectId}-error" class="text-sm text-destructive flex items-center gap-1" role="alert">
			<AlertCircle class="h-3 w-3" />
			{error}
		</p>
	{/if}
</div>

