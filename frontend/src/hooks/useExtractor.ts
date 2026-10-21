import { useState } from 'react';
import { PlaceData } from '../types';
import { extractPhotos } from '../services/api';

interface UseExtractorReturn {
  loading: boolean;
  error: string | null;
  placeData: PlaceData | null;
  source: 'cache' | 'api' | null;
  extract: (url: string) => Promise<void>;
  reset: () => void;
}

export function useExtractor(): UseExtractorReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeData, setPlaceData] = useState<PlaceData | null>(null);
  const [source, setSource] = useState<'cache' | 'api' | null>(null);

  const extract = async (url: string) => {
    setLoading(true);
    setError(null);
    setPlaceData(null);
    setSource(null);

    try {
      const response = await extractPhotos(url);

      if (response.success && response.data) {
        setPlaceData(response.data);
        setSource(response.source || null);
      } else {
        setError(response.error || 'An unexpected error occurred');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Failed to extract photos');
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPlaceData(null);
    setError(null);
    setSource(null);
  };

  return { loading, error, placeData, source, extract, reset };
}
