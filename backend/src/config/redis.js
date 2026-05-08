import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connection established');
});

redisClient.on('ready', () => {
  console.log('✅ Redis is ready');
});

// Connect to Redis
await redisClient.connect().catch((err) => {
  console.warn('⚠️ Redis connection warning:', err.message);
  console.warn('⚠️ Proceeding without Redis caching');
});

export default redisClient;
