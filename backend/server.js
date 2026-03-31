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

// MongoDB connection
const DB = process.env.DATABASE_URL
  .replace("<USERNAME>", process.env.DATABASE_USER)
  .replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

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
});

global.io = io;

// Store worker locations
let workerLocations = {};


io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
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

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});


// Start server after DB connection
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}...`);
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
