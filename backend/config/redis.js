const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));
redisClient.on("connect", () => console.log("🐦🐦🐦🐦 Redis Connected"));
redisClient.on("reconnecting", () => console.log("♻️ Redis Reconnecting..."));

// Initiate the connection
redisClient.connect().catch(console.error);

module.exports = redisClient;