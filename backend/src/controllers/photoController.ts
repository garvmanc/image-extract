import { Request, Response } from 'express';
import axios from 'axios';
import { getPhotoUrl } from '../services/googlePlaces';

/**
 * Proxy photo requests to Google Places API.
 * This keeps the API key hidden from the frontend.
 */
export async function proxyPhoto(req: Request, res: Response): Promise<void> {
  try {
    const { reference } = req.params;
    const maxWidth = parseInt(req.query.maxwidth as string) || 1600;

    if (!reference) {
      res.status(400).json({ success: false, error: 'Photo reference is required' });
      return;
    }

    const photoUrl = getPhotoUrl(reference, maxWidth);

    const response = await axios.get(photoUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'X-Content-Type-Options': 'nosniff',
    });

    res.send(response.data);
  } catch (error) {
    console.error('Photo proxy error:', error);
    res.status(502).json({ success: false, error: 'Failed to fetch photo' });
  }
}
