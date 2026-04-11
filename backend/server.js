const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app"); 

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Load environment variables
dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

// MongoDB connection
const DB = process.env.DATABASE_URL;

mongoose
  .connect(DB)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Create HTTP server for Express + Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
});

global.io = io;

// Store worker locations (In-memory storage)
let workerLocations = {};

io.on("connection", (socket) => {
  // Join room
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  // Worker sends live location
  socket.on("worker-location", (data) => {
    if (!data || !data.workerId) return;

    const payload = {
      workerId: data.workerId,
      lat: data.lat,
      lng: data.lng,
      ts: Date.now(),
      meta: data.meta || null,
    };

    workerLocations[data.workerId] = payload;
    io.emit("location-update", payload);
  });

  // Send last known locations
  socket.on("request-last-locations", () => {
    socket.emit("last-locations", Object.values(workerLocations));
  });

  socket.on("disconnect", () => {});
});

// 2. Simplified start-up (Removed await redisClient.connect())
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}...`);
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  
  
  server.close(() => process.exit(1));
});