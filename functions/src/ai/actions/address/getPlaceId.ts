/**
 * Get place ID from autocomplete API
 */

export async function getPlaceId(input: string, apiKey: string): Promise<string | null> {
  const sessionToken = Math.random().toString(36).slice(2);
  
  const autocompleteResp = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "suggestions.placePrediction.text,suggestions.placePrediction.place",
    },
    body: JSON.stringify({
      input,
      languageCode: "en",
      sessionToken,
    }),
  });
  
  if (!autocompleteResp.ok) {
    console.error('Address autocomplete failed:', await autocompleteResp.text());
    return null;
  }
  
  const autocompleteJson = await autocompleteResp.json();
  const suggestions = (autocompleteJson?.suggestions || []).map((s: any) => ({
    text: s?.placePrediction?.text?.text ?? "",
    placeResource: s?.placePrediction?.place ?? "",
  })).filter((p: any) => p.text && p.placeResource);
  
  if (suggestions.length === 0) {
    console.warn('No address suggestions found for:', input);
    return null;
  }
  
  return suggestions[0].placeResource || null;
}


