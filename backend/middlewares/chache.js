const redisClient = require("../config/redis");

// Cache middleware
const cache = (keyPrefix, ttl = 60) => {
  return async (req, res, next) => {
    try {
      const key = keyPrefix + JSON.stringify(req.params) + JSON.stringify(req.query);

      // Check if cache exists
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json({ fromCache: true, data: JSON.parse(cachedData) });
      }

      // Modify res.json to save data in cache
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        redisClient.setEx(key, ttl, JSON.stringify(body.data || body));
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Cache error:", error);
      next();
    }
  };
};

module.exports = cache;
