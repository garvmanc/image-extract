import { Router } from 'express';
import { extractPhotos, getStats } from '../controllers/extractController';
import { proxyPhoto } from '../controllers/photoController';
import { apiRateLimiter, photoRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Main extraction endpoint
router.post('/extract-photos', apiRateLimiter, extractPhotos);

// Photo proxy endpoint (keeps API key hidden from frontend)
router.get('/photos/:reference', photoRateLimiter, proxyPhoto);

// Stats endpoint (for monitoring cache efficiency)
router.get('/stats', getStats);

// Health check
router.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
