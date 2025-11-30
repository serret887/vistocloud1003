// Re-export from parent to maintain backward compatibility
// This file exists to allow imports from './addressResolver' directory
export {
  resolveAddress,
  resolveAddresses,
  getPlaceSuggestions,
  getPlaceDetails,
  isGooglePlacesAvailable,
  type AddressType,
  type PlaceSuggestion
} from '../addressResolver';
