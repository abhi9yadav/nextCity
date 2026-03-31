const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config({ path: "./.env" });
const app = require("./app");

const DB = process.env.DATABASE_URL
  .replace('<USERNAME>', process.env.DATABASE_USER)
  .replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// Connect MongoDB
mongoose
  .connect(DB)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));


// Start server after DB connection
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}......`);
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
  });
});

