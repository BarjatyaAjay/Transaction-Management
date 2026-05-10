import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = {
  isOpen: false,
  get: async () => null,
  setEx: async () => {},
  keys: async () => [],
  del: async () => {},
};

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  redisClient = createClient({
    url: redisUrl,
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
} else {
  console.warn('⚠️ REDIS_URL not set; Redis caching disabled');
}

export default redisClient;
