"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/app/hooks/use-debounce";
import { Delete, Loader2, Pencil } from "lucide-react";
import AddressDialog from "./address-dialog";
import { 
  resolveAddress, 
  getPlaceSuggestions, 
  getPlaceDetails, 
  isGooglePlacesAvailable,
  type AddressType as ResolverAddressType,
  type PlaceSuggestion 
} from "@/lib/addressResolver";

// Use the same AddressType from addressResolver
export type AddressType = ResolverAddressType;

interface AddressAutoCompleteProps {
    address: AddressType;
    setAddress: (address: AddressType) => void;
    dialogTitle: string;
    showInlineError?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
    // Optional controlled search input; if omitted, component manages its own state
    searchInput?: string;
    setSearchInput?: (searchInput: string) => void;
}

export default function AddressAutoComplete(props: AddressAutoCompleteProps) {
	const {
		address,
		setAddress,
		dialogTitle,
		showInlineError = true,
        searchInput: controlledSearchInput,
        setSearchInput: setControlledSearchInput,
		placeholder,
		autoFocus = false,
	} = props;

    // Manage internal search state when not controlled
    const [uncontrolledSearch, setUncontrolledSearch] = useState("");
    const searchInput = controlledSearchInput ?? uncontrolledSearch;
    const setSearchInput = setControlledSearchInput ?? setUncontrolledSearch;

	const [selectedPlaceId, setSelectedPlaceId] = useState("");
	const [isOpen, setIsOpen] = useState(false);

    // Address resolution state
    const sessionTokenRef = useRef<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [adrAddress, setAdrAddress] = useState("");

    const ensureSessionToken = () => {
        if (!sessionTokenRef.current) {
            // Simple pseudo-random token; for production consider crypto.randomUUID()
            sessionTokenRef.current = Math.random().toString(36).slice(2);
        }
        return sessionTokenRef.current;
    };

    const debouncedSearchInput = useDebounce(searchInput, 1500);
    const [predictions, setPredictions] = useState<PlaceSuggestion[]>([]);

    // Fetch autocomplete suggestions from Google Places
    useEffect(() => {
        let abort = false;
        async function run() {
            const input = debouncedSearchInput?.trim();
            if (!input) {
                setPredictions([]);
                return;
            }

            if (!isGooglePlacesAvailable()) {
                // Fallback: create a simple prediction for manual resolution
                console.warn("VITE_GOOGLE_MAPS_API_KEY is not set; using basic address parsing");
                const prediction: PlaceSuggestion = {
                    text: input,
                    placeResource: input // Use the input as the resource for resolution
                };
                if (!abort) setPredictions([prediction]);
                return;
            }

            setIsLoading(true);
            try {
                const suggestions = await getPlaceSuggestions(input, ensureSessionToken());
                if (!abort) setPredictions(suggestions);
            } catch (e) {
                if (!abort) setPredictions([]);
            } finally {
                if (!abort) setIsLoading(false);
            }
        }
        run();
        return () => {
            abort = true;
        };
    }, [debouncedSearchInput]);

    // Handle address resolution using addressResolver utility
    const handleAddressResolution = useCallback(async (addressString: string) => {
        if (!addressString.trim()) {
            setPredictions([]);
            return;
        }

        setIsLoading(true);
        try {
            const resolvedAddress = await resolveAddress(addressString);
            if (resolvedAddress) {
                setAddress(resolvedAddress);
                setAdrAddress(resolvedAddress.formattedAddress);
                setSelectedPlaceId("resolved"); // Mark as resolved
                setSearchInput(""); // Clear search input
            }
        } catch (error) {
            console.error('Address resolution failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [setAddress, setSearchInput]);

    // Fetch selected place details using addressResolver
    useEffect(() => {
        let abort = false;
        async function loadPlace() {
            if (!selectedPlaceId || selectedPlaceId === "resolved") return;
            setIsLoading(true);
            try {
                const resolvedAddress = await getPlaceDetails(selectedPlaceId);
                if (resolvedAddress && !abort) {
                    setAddress(resolvedAddress);
                    setAdrAddress(resolvedAddress.formattedAddress);
                }
            } catch (error) {
                console.error('Address resolution failed:', error);
            } finally {
                if (!abort) setIsLoading(false);
            }
        }
        loadPlace();
        return () => {
            abort = true;
        };
    }, [selectedPlaceId, setAddress]);

	return (
		<>
			{selectedPlaceId !== "" || address.formattedAddress ? (
				<div className="flex items-center gap-2">
					<Input value={address?.formattedAddress} readOnly />

					<AddressDialog
						isLoading={isLoading}
						dialogTitle={dialogTitle}
						adrAddress={adrAddress}
						address={address}
						setAddress={setAddress}
						open={isOpen}
						setOpen={setIsOpen}
					>
						<Button
							disabled={isLoading}
							size="icon"
							variant="outline"
							className="shrink-0"
						>
							<Pencil className="size-4" />
						</Button>
					</AddressDialog>
					<Button
						type="reset"
						onClick={() => {
							setSelectedPlaceId("");
							setAddress({
								address1: "",
								address2: "",
								formattedAddress: "",
								city: "",
								region: "",
								postalCode: "",
								country: "",
								lat: 0,
								lng: 0,
							});
						}}
						size="icon"
						variant="outline"
						className="shrink-0"
					>
						<Delete className="size-4" />
					</Button>
				</div>
			) : (
                <AddressAutoCompleteInput
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    selectedPlaceId={selectedPlaceId}
                    setSelectedPlaceId={setSelectedPlaceId}
                    setIsOpenDialog={setIsOpen}
                    showInlineError={showInlineError}
                    placeholder={placeholder}
                    isLoading={isLoading}
                    predictions={predictions}
                    autoFocus={autoFocus}
                    onAddressResolution={handleAddressResolution}
                />
			)}
		</>
	);
}

interface CommonProps {
	selectedPlaceId: string;
	setSelectedPlaceId: (placeId: string) => void;
	setIsOpenDialog: (isOpen: boolean) => void;
	showInlineError?: boolean;
	searchInput: string;
	setSearchInput: (searchInput: string) => void;
	placeholder?: string;
    isLoading: boolean;
    predictions: PlaceSuggestion[];
    autoFocus?: boolean;
    onAddressResolution: (addressString: string) => Promise<void>;
}

function AddressAutoCompleteInput(props: CommonProps) {
	const {
		selectedPlaceId,
		setSelectedPlaceId,
		showInlineError,
		searchInput,
		setSearchInput,
		placeholder,
        isLoading,
        predictions,
		autoFocus = false,
        onAddressResolution,
	} = props;

	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => {
		setIsOpen(false);
		setHighlightedIndex(-1);
	}, []);

	// Auto-focus the input when autoFocus is true
	useEffect(() => {
		if (autoFocus && inputRef.current) {
			inputRef.current.focus();
		}
	}, [autoFocus]);

	// Reset highlighted index when predictions change
	useEffect(() => {
		setHighlightedIndex(-1);
	}, [predictions]);

	// Scroll highlighted option into view
	// useEffect(() => {
	// 	if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
	// 		optionRefs.current[highlightedIndex]?.scrollIntoView({
	// 			block: 'nearest',
	// 			behavior: 'smooth'
	// 		});
	// 	}
	// }, [highlightedIndex]);

	const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
		// Check if the new focus target is within the dropdown container
		// If it is, don't close the dropdown
		const relatedTarget = e.relatedTarget as Node;
		if (containerRef.current && containerRef.current.contains(relatedTarget)) {
			return;
		}
		// Close after a small delay to allow click events to fire
		setTimeout(() => {
			close();
		}, 150);
	}, [close]);

	const selectPrediction = useCallback((prediction: PlaceSuggestion) => {
		setSearchInput("");
		setSelectedPlaceId(prediction.placeResource);
		close();
	}, [setSearchInput, close]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen) {
			if (event.key === "ArrowDown" && predictions.length > 0) {
				event.preventDefault();
				open();
			}
			return;
		}

		switch (event.key) {
			case "Escape":
				event.preventDefault();
				close();
				break;
			case "ArrowDown":
				event.preventDefault();
				setHighlightedIndex((prev) => 
					prev < predictions.length - 1 ? prev + 1 : prev
				);
				break;
			case "ArrowUp":
				event.preventDefault();
				setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
				break;
			case "Enter":
				event.preventDefault();
				if (highlightedIndex >= 0 && highlightedIndex < predictions.length) {
					selectPrediction(predictions[highlightedIndex]);
				} else if (searchInput.trim()) {
					// If no prediction is highlighted but there's input, resolve it directly using addressResolver
					onAddressResolution(searchInput.trim());
					close();
				}
				break;
			case "Tab":
				close();
				break;
		}
	};

    // predictions and loading provided by parent hooked to Google Places

	return (
		<div ref={containerRef} onKeyDown={handleKeyDown} className="overflow-visible">
			<div className="flex w-full items-center justify-between rounded-lg border bg-background ring-offset-background text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
				<Input
					ref={inputRef}
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					onFocus={open}
					onBlur={handleBlur}
					placeholder={placeholder || "Enter address"}
					className="w-full p-3 rounded-lg"
				/>
			</div>
			{searchInput !== "" && !isOpen && !selectedPlaceId && showInlineError && (
				<div className="pt-1 text-sm text-destructive">Select a valid address from the list</div>
			)}

			{isOpen && (
				<div className="relative animate-in fade-in-0 zoom-in-95 h-auto">
					<div className="absolute top-1.5 z-50 w-full">
						<div className="relative h-auto z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md bg-background">
							{isLoading ? (
								<div className="h-28 flex items-center justify-center">
									<Loader2 className="size-6 animate-spin" />
								</div>
							) : (
								<>
                                    {predictions.map((p, index) => (
                                        <button
											ref={(el) => { optionRefs.current[index] = el; }}
                                            type="button"
                                            onClick={() => selectPrediction(p)}
                                            className={`w-full text-left cursor-pointer gap-0.5 h-max p-2 px-3 block hover:bg-accent hover:text-accent-foreground ${
												index === highlightedIndex ? 'bg-accent text-accent-foreground' : ''
											}`}
                                            key={p.placeResource}
                                            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
											onMouseEnter={() => setHighlightedIndex(index)}
                                        >
                                            {p.text}
                                        </button>
                                    ))}
								</>
							)}

							{!isLoading && predictions.length === 0 && (
								<div className="py-4 flex items-center justify-center">
									{searchInput === "" ? "Please enter an address" : "No address found"}
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
