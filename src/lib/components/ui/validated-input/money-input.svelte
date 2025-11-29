<script lang="ts">
	import { Input, Label } from '$lib/components/ui';
	import { DollarSign, AlertCircle } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'oninput' | 'type'> {
		label?: string;
		value?: number | string;
		onValueChange?: (value: number) => void;
		required?: boolean;
		error?: string;
		showError?: boolean;
	}

	let {
		label,
		value: propValue = 0,
		onValueChange,
		required = false,
		error,
		showError = false,
		class: className,
		id,
		...restProps
	}: Props = $props();

	// Convert number to string for display, but show empty if 0
	let displayValue = $state(typeof propValue === 'number' ? (propValue === 0 ? '' : String(propValue)) : (propValue || ''));

	// Sync prop value changes
	$effect(() => {
		const newValue = typeof propValue === 'number' ? (propValue === 0 ? '' : String(propValue)) : (propValue || '');
		if (newValue !== displayValue) {
			displayValue = newValue;
		}
	});

	const hasError = $derived(!!error && showError);
	const inputId = $derived(id || `money-input-${Math.random().toString(36).slice(2, 9)}`);

	function handleInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const inputValue = target.value;
		displayValue = inputValue;
		
		// Convert to number for the callback
		if (inputValue === '' || inputValue.trim() === '') {
			onValueChange?.(0);
		} else {
			const num = parseFloat(inputValue);
			if (!isNaN(num)) {
				onValueChange?.(num);
			}
		}
	}

	function handleBlur() {
		// Re-validate could be added here if needed
	}
</script>

<div class="space-y-2">
	{#if label}
		<Label for={inputId} class={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
			{label}
		</Label>
	{/if}
	
	<div class="relative">
		<DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
		<Input
			id={inputId}
			type="number"
			value={displayValue}
			oninput={handleInput}
			onblur={handleBlur}
			class={cn(
				"pl-9",
				hasError && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
				className
			)}
			aria-invalid={hasError}
			aria-describedby={hasError ? `${inputId}-error` : undefined}
			placeholder="0.00"
			{...restProps}
		/>
		{#if hasError}
			<AlertCircle class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
		{/if}
	</div>
	
	{#if hasError}
		<p id="{inputId}-error" class="text-sm text-destructive flex items-center gap-1" role="alert">
			<AlertCircle class="h-3 w-3" />
			{error}
		</p>
	{/if}
</div>

