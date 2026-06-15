export interface Photo {
  photoReference: string;
  width: number;
  height: number;
  htmlAttributions: string[];
  photoUrl: string;
}

export interface PlaceData {
  placeId: string;
  name: string;
  formattedAddress: string;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  phoneNumber?: string;
  website?: string;
  googleMapsUrl: string;
  photos: Photo[];
  lastFetchedAt: string;
}

export interface ExtractResponse {
  success: boolean;
  source?: 'cache' | 'api';
  data?: PlaceData;
  error?: string;
}

export interface StatsData {
  totalPlaces: number;
  totalRequests: number;
  cacheHits: number;
  apiCalls: number;
  cacheHitRate: string;
}
