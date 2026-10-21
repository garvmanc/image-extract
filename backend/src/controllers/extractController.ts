import { Request, Response } from 'express';
import { z } from 'zod';
import { Place } from '../models/Place';
import { RequestLog } from '../models/RequestLog';
import { extractPlaceIdFromUrl, extractSearchQuery, isValidGoogleMapsUrl } from '../utils/urlParser';
import { getPlaceDetails, getProxiedPhotoUrl, searchPlaceByText } from '../services/googlePlaces';

const extractSchema = z.object({
  url: z.string().url('Please provide a valid URL'),
});

export async function extractPhotos(req: Request, res: Response): Promise<void> {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const { url } = extractSchema.parse(req.body);

    if (!isValidGoogleMapsUrl(url)) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid Google Maps URL',
      });
      return;
    }

    // Step 1: Try to extract Place ID from URL
    let placeId = await extractPlaceIdFromUrl(url);

    // Step 2: If no Place ID, try text search (minimal cost)
    if (!placeId) {
      const query = extractSearchQuery(url);
      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Could not extract business information from this URL. Please try a direct Google Maps business link.',
        });
        return;
      }

      const searchResult = await searchPlaceByText(query);
      if (!searchResult) {
        res.status(404).json({
          success: false,
          error: 'Business not found. Please verify the URL and try again.',
        });
        return;
      }
      placeId = searchResult.placeId;
    }

    // Step 3: Check database cache FIRST (zero-cost priority)
    const cachedPlace = await Place.findOne({ placeId });
    if (cachedPlace) {
      await RequestLog.create({
        ip,
        url,
        placeId,
        source: 'cache',
        success: true,
      });

      res.json({
        success: true,
        source: 'cache',
        data: {
          placeId: cachedPlace.placeId,
          name: cachedPlace.name,
          formattedAddress: cachedPlace.formattedAddress,
          types: cachedPlace.types,
          rating: cachedPlace.rating,
          userRatingsTotal: cachedPlace.userRatingsTotal,
          phoneNumber: cachedPlace.phoneNumber,
          website: cachedPlace.website,
          googleMapsUrl: cachedPlace.googleMapsUrl,
          photos: cachedPlace.photos,
          lastFetchedAt: cachedPlace.lastFetchedAt,
        },
      });
      return;
    }

    // Step 4: Fetch from Google API (only if not cached)
    const details = await getPlaceDetails(placeId);

    // Step 5: Transform photos with proxied URLs
    const photos = details.photos.map((photo) => ({
      photoReference: photo.photo_reference,
      width: photo.width,
      height: photo.height,
      htmlAttributions: photo.html_attributions,
      photoUrl: getProxiedPhotoUrl(photo.photo_reference),
    }));

    // Step 6: Save to database immediately (cache for future)
    const placeData = {
      placeId: details.placeId,
      name: details.name,
      formattedAddress: details.formattedAddress,
      types: details.types,
      rating: details.rating,
      userRatingsTotal: details.userRatingsTotal,
      phoneNumber: details.phoneNumber,
      website: details.website,
      googleMapsUrl: url,
      photos,
      lastFetchedAt: new Date(),
    };

    await Place.findOneAndUpdate({ placeId }, placeData, { upsert: true, new: true });

    await RequestLog.create({
      ip,
      url,
      placeId,
      source: 'api',
      success: true,
    });

    res.json({
      success: true,
      source: 'api',
      data: placeData,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    await RequestLog.create({
      ip,
      url: req.body?.url || 'unknown',
      source: 'api',
      success: false,
      errorMessage,
    }).catch(() => {}); // Don't fail if logging fails

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Invalid input',
      });
      return;
    }

    console.error('Extract photos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract photos. Please try again later.',
    });
  }
}

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const totalPlaces = await Place.countDocuments();
    const totalRequests = await RequestLog.countDocuments();
    const cacheHits = await RequestLog.countDocuments({ source: 'cache' });
    const apiCalls = await RequestLog.countDocuments({ source: 'api' });

    res.json({
      success: true,
      data: {
        totalPlaces,
        totalRequests,
        cacheHits,
        apiCalls,
        cacheHitRate: totalRequests > 0 ? ((cacheHits / totalRequests) * 100).toFixed(1) : '0',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
}
