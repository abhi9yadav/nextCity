const redis = require("redis");

let redisClient;

(async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (err) => console.error("❌ Redis Error:", err));
  redisClient.on("connect", () => console.log("🐦🐦🐦🐦🐦🐦🐦🐦 Redis Connected"));
  redisClient.on("reconnecting", () => console.log("♻️ Redis Reconnecting..."));

  await redisClient.connect();
})();

module.exports = redisClient;
