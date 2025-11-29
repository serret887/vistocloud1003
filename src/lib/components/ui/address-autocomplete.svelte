<script lang="ts">
	import { cn } from '$lib/utils';
	import { Input } from '$lib/components/ui';
	import { MapPin, Loader2 } from 'lucide-svelte';
	import { getPlaceSuggestions, getPlaceDetails, type PlaceSuggestion } from '$lib/addressResolver';
	import type { AddressType } from '$lib/types/address';
	
	interface Props {
		value?: AddressType;
		placeholder?: string;
		class?: string;
		onchange?: (address: AddressType) => void;
	}
	
	let { value, placeholder = 'Start typing an address...', class: className, onchange }: Props = $props();
	
	let inputValue = $state(value?.formattedAddress || value?.address1 || '');
	let suggestions = $state<PlaceSuggestion[]>([]);
	let isLoading = $state(false);
	let showSuggestions = $state(false);
	let sessionToken = $state(Math.random().toString(36).slice(2));
	let debounceTimer: ReturnType<typeof setTimeout>;
	
	let isUserTyping = $state(false);
	
	// Sync inputValue with value prop when it changes (e.g., when data loads from Firebase)
	// But only if user is not actively typing
	$effect(() => {
		if (!isUserTyping && value) {
			const newValue = value.formattedAddress || value.address1 || '';
			if (newValue && newValue !== inputValue) {
				inputValue = newValue;
			}
		} else if (!isUserTyping && !value && inputValue) {
			// Clear input if value becomes null/undefined
			inputValue = '';
		}
	});
	
	async function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		inputValue = target.value;
		isUserTyping = true;
		
		// If user clears the input, clear the address
		if (inputValue.trim() === '') {
			onchange?.(createEmptyAddress());
			suggestions = [];
			showSuggestions = false;
			// Reset typing flag after a delay
			setTimeout(() => { isUserTyping = false; }, 100);
			return;
		}
		
		if (inputValue.length < 3) {
			suggestions = [];
			showSuggestions = false;
			return;
		}
		
		// Debounce the API call
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			isLoading = true;
			try {
				suggestions = await getPlaceSuggestions(inputValue, sessionToken);
				showSuggestions = suggestions.length > 0;
			} catch (err) {
				console.error('Error fetching suggestions:', err);
				suggestions = [];
			} finally {
				isLoading = false;
			}
		}, 300);
	}
	
	async function selectSuggestion(suggestion: PlaceSuggestion) {
		isLoading = true;
		showSuggestions = false;
		isUserTyping = false; // User selected, so sync with prop
		
		try {
			const details = await getPlaceDetails(suggestion.placeResource);
			if (details) {
				inputValue = details.formattedAddress || suggestion.text;
				onchange?.(details);
			}
		} catch (err) {
			console.error('Error fetching place details:', err);
			inputValue = suggestion.text;
		} finally {
			isLoading = false;
			// Generate new session token for next search
			sessionToken = Math.random().toString(36).slice(2);
		}
	}
	
	function createEmptyAddress(): AddressType {
		return {
			address1: '',
			address2: '',
			formattedAddress: '',
			city: '',
			region: '',
			postalCode: '',
			country: '',
			lat: 0,
			lng: 0
		};
	}
	
	function handleBlur() {
		// Delay hiding suggestions to allow click to register
		setTimeout(() => {
			showSuggestions = false;
		}, 200);
	}
	
	function handleFocus() {
		if (suggestions.length > 0) {
			showSuggestions = true;
		}
	}
</script>

<div class={cn('relative', className)}>
	<div class="relative">
		<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
		<Input
			type="text"
			{placeholder}
			value={inputValue}
			oninput={handleInput}
			onblur={() => {
				handleBlur();
				// Reset typing flag on blur
				setTimeout(() => { isUserTyping = false; }, 300);
			}}
			onfocus={handleFocus}
			class="pl-10 pr-10"
		/>
		{#if isLoading}
			<Loader2 class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
		{:else if inputValue}
			<button
				type="button"
				onclick={() => {
					inputValue = '';
					onchange?.(createEmptyAddress());
					isUserTyping = false;
				}}
				class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
			>
				×
			</button>
		{/if}
	</div>
	
	{#if showSuggestions && suggestions.length > 0}
		<div class="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
			{#each suggestions as suggestion}
				<button
					type="button"
					class="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
					onclick={() => selectSuggestion(suggestion)}
				>
					<MapPin class="h-4 w-4 text-muted-foreground shrink-0" />
					<span class="truncate">{suggestion.text}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

