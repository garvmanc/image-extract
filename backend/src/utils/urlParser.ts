import axios from 'axios';

/**
 * Extracts Place ID from various Google Maps URL formats.
 * Supports:
 * - https://www.google.com/maps/place/...?...data=!...!1s<place_id>...
 * - https://maps.google.com/?cid=...
 * - URLs with place_id query parameter
 * - Shortened goo.gl/maps URLs (resolved first)
 */
export async function extractPlaceIdFromUrl(url: string): Promise<string | null> {
  let resolvedUrl = url;

  // Resolve shortened URLs
  if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
    resolvedUrl = await resolveShortUrl(url);
  }

  // Try extracting from query params
  try {
    const urlObj = new URL(resolvedUrl);
    const placeIdParam = urlObj.searchParams.get('place_id');
    if (placeIdParam) return placeIdParam;
  } catch {
    // Not a valid URL, continue with regex
  }

  // Try extracting from the data parameter (format: !1sChIJ...)
  const dataMatch = resolvedUrl.match(/!1s(ChIJ[A-Za-z0-9_-]+)/);
  if (dataMatch) return dataMatch[1];

  // Try extracting from the /place/ path with embedded place id
  const placePathMatch = resolvedUrl.match(/place_id[=:]([A-Za-z0-9_-]+)/);
  if (placePathMatch) return placePathMatch[1];

  return null;
}

/**
 * Extracts a search query from the Google Maps URL for text search fallback.
 */
export function extractSearchQuery(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Try /maps/place/<name> format
    const placeMatch = url.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }

    // Try query parameter
    const query = urlObj.searchParams.get('q');
    if (query) return query;

    return null;
  } catch {
    return null;
  }
}

async function resolveShortUrl(shortUrl: string): Promise<string> {
  try {
    const response = await axios.head(shortUrl, {
      maxRedirects: 5,
      timeout: 10000,
      validateStatus: () => true,
    });
    return (response.request?.res?.responseUrl as string) || shortUrl;
  } catch {
    // If HEAD fails, try GET with redirect following
    try {
      const response = await axios.get(shortUrl, {
        maxRedirects: 5,
        timeout: 10000,
        validateStatus: () => true,
      });
      return response.request?.res?.responseUrl || shortUrl;
    } catch {
      return shortUrl;
    }
  }
}

/**
 * Validates if a given string is a valid Google Maps URL
 */
export function isValidGoogleMapsUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?google\.[a-z.]+\/maps/,
    /^https?:\/\/maps\.google\.[a-z.]+/,
    /^https?:\/\/goo\.gl\/maps/,
    /^https?:\/\/maps\.app\.goo\.gl/,
  ];
  return patterns.some((pattern) => pattern.test(url));
}
