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

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5000"], // your frontend URLs
    methods: ["GET", "POST"],
  },
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join room based on userId
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
// Store worker live locations (temporary memory)
let workerLocations = {}; // { workerId: { lat, lng, ts } }

// 🔹 Socket.IO logic
io.on("connection", (socket) => {
  console.log("🟢😎😎😎🫡 Socket connected:", socket.id);

  // Worker emits its live location
  socket.on("worker-location", (data) => {
    // expected: { workerId, lat, lng }
    if (!data || !data.workerId) return;

    const payload = {
      workerId: data.workerId,
      lat: data.lat,
      lng: data.lng,
      ts: Date.now(),
      meta: data.meta || null,
    };
    console.log("payload is here boys",payload);

    // Save latest position
    workerLocations[data.workerId] = payload;

    // Broadcast to all connected dashboards
    io.emit("location-update", payload);
  });

  // Dashboard requests last known locations
  socket.on("request-last-locations", () => {
    socket.emit("last-locations", Object.values(workerLocations));
  });

  // When a socket disconnects
  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
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
