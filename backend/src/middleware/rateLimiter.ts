import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * IP-based rate limiting to prevent API budget exhaustion.
 * Configured for zero-cost operation within Google's $200/month free credit.
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs, // 15 minutes
  max: env.rateLimitMaxRequests, // 50 requests per window
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(env.rateLimitWindowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

/**
 * Stricter rate limiter for photo proxy endpoint.
 */
export const photoRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 100, // 100 photo requests per minute
  message: {
    success: false,
    error: 'Too many photo requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
