import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import apiRoutes from './routes/api';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start(): Promise<void> {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`🚀 Server running on port ${env.port} (${env.nodeEnv})`);
    console.log(`📊 Rate limit: ${env.rateLimitMaxRequests} requests per ${env.rateLimitWindowMs / 1000}s`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
