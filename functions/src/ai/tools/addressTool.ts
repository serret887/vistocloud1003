/**
 * Genkit tool for address resolution using Google Places API
 */

import { z } from 'genkit';
import { resolveAddress } from '../actions/address';

/**
 * Define address resolution tool for Genkit
 * This allows the LLM to call address resolution as a tool
 */
export function createAddressResolutionTool(ai: any) {
  return ai.defineTool(
    {
      name: 'resolveAddress',
      description: 'Resolve a partial address string to a complete, validated address using Google Places API. Use this when the user provides an incomplete address (e.g., just street and city) and you need to get the full address details including postal code, region, coordinates, and formatted address.',
      inputSchema: z.object({
        addressString: z.string().describe('The partial address string to resolve (e.g., "4027 Pierce Street, Hollywood")'),
      }),
      outputSchema: z.object({
        address1: z.string().optional(),
        address2: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        formattedAddress: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        success: z.boolean().describe('Whether the address was successfully resolved'),
        error: z.string().optional().describe('Error message if resolution failed'),
      }),
    },
    async (input) => {
      try {
        const resolved = await resolveAddress(input.addressString);
        
        if (resolved) {
          return {
            ...resolved,
            success: true,
          };
        } else {
          return {
            success: false,
            error: 'Could not resolve address',
          };
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Address resolution failed',
        };
      }
    }
  );
}

