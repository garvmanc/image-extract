import axios from 'axios';
import { ExtractResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export async function extractPhotos(url: string): Promise<ExtractResponse> {
  const response = await api.post<ExtractResponse>('/extract-photos', { url });
  return response.data;
}

export function getPhotoUrl(photoReference: string, maxWidth: number = 1600): string {
  return `/api/photos/${encodeURIComponent(photoReference)}?maxwidth=${maxWidth}`;
}
