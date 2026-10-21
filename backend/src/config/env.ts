import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  GOOGLE_PLACES_API_KEY: z.string().min(1, 'GOOGLE_PLACES_API_KEY is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('50'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port: parseInt(parsed.data.PORT, 10),
  mongoUri: parsed.data.MONGODB_URI,
  googleApiKey: parsed.data.GOOGLE_PLACES_API_KEY,
  nodeEnv: parsed.data.NODE_ENV,
  rateLimitWindowMs: parseInt(parsed.data.RATE_LIMIT_WINDOW_MS, 10),
  rateLimitMaxRequests: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),
  corsOrigin: parsed.data.CORS_ORIGIN,
};
