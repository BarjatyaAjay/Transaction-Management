import redisClient from '../config/redis.js';

export const cacheMiddleware = (cacheDurationSeconds) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    if (!req.user) {
      return next();
    }

    // Skip caching if Redis is not available
    if (!redisClient.isOpen) {
      return next();
    }

    try {
      const cacheKey = `user:${req.user.id}:${req.baseUrl}:${JSON.stringify(req.query)}`;
      
      // Try to get from cache
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        console.log(`✅ Cache hit for: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        redisClient.setEx(cacheKey, cacheDurationSeconds, JSON.stringify(data))
          .catch((err) => console.error('Cache set error:', err));
        
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const invalidateUserCache = async (userId) => {
  if (!redisClient.isOpen) return;

  try {
    // Get all keys matching the user pattern
    const keys = await redisClient.keys(`user:${userId}:*`);
    
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️ Invalidated ${keys.length} cache entries for user: ${userId}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

export const invalidateCategoryCache = async (userId) => {
  if (!redisClient.isOpen) return;

  try {
    // Invalidate category-related cache
    const keys = await redisClient.keys(`user:${userId}:*/analytics/category*`);
    
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️ Invalidated category cache for user: ${userId}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};
