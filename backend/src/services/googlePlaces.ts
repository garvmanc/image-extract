import axios from 'axios';
import { env } from '../config/env';

interface PlaceSearchResult {
  placeId: string;
}

interface PlaceDetailsResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  phoneNumber?: string;
  website?: string;
  photos: PhotoReference[];
}

interface PhotoReference {
  photo_reference: string;
  width: number;
  height: number;
  html_attributions: string[];
}

const PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Search for a place using Text Search (ID-only field mask for cost optimization).
 * Text Search with only place_id field is free.
 */
export async function searchPlaceByText(query: string): Promise<PlaceSearchResult | null> {
  try {
    const response = await axios.get(`${PLACES_BASE_URL}/textsearch/json`, {
      params: {
        query,
        key: env.googleApiKey,
        fields: 'place_id',
      },
    });

    if (response.data.status === 'OK' && response.data.results?.length > 0) {
      return { placeId: response.data.results[0].place_id };
    }

    return null;
  } catch (error) {
    console.error('Text Search API error:', error);
    throw new Error('Failed to search for place');
  }
}

/**
 * Get place details with strict field mask to minimize cost.
 * Only requests fields we actually need.
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResult> {
  const fields = [
    'place_id',
    'name',
    'formatted_address',
    'type',
    'rating',
    'user_ratings_total',
    'formatted_phone_number',
    'website',
    'photos',
  ].join(',');

  try {
    const response = await axios.get(`${PLACES_BASE_URL}/details/json`, {
      params: {
        place_id: placeId,
        key: env.googleApiKey,
        fields,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Place Details API returned status: ${response.data.status}`);
    }

    const result = response.data.result;

    return {
      placeId: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address || '',
      types: result.types || [],
      rating: result.rating,
      userRatingsTotal: result.user_ratings_total,
      phoneNumber: result.formatted_phone_number,
      website: result.website,
      photos: result.photos || [],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Place Details API error: ${error.response?.data?.error_message || error.message}`);
    }
    throw error;
  }
}

/**
 * Generate a photo URL from a photo reference.
 * Uses the Places Photo API endpoint which proxies through our backend.
 */
export function getPhotoUrl(photoReference: string, maxWidth: number = 1600): string {
  return `${PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${env.googleApiKey}`;
}

/**
 * Generate the proxied photo URL (what we expose to the frontend).
 */
export function getProxiedPhotoUrl(photoReference: string, maxWidth: number = 1600): string {
  return `/api/photos/${encodeURIComponent(photoReference)}?maxwidth=${maxWidth}`;
}
