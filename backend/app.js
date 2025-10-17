const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRoutes = require("./routes/authRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const rootDir = require('./utils/rootDir');
const authRoutes = require("./routes/authRoutes");
const cityAdminRoutes = require("./routes/cityAdminRoutes");
const zoneRoutes = require("./routes/zoneRoutes");
const workerRoutes = require("./routes/workerRoutes");
const deptAdminRoutes = require("./routes/deptAdminRoutes");

const app = express();

// Middlewares
app.use(express.static(path.join(rootDir, 'public')));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2);

// Routes
console.log("Setting up routes...");
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/superAdmin", superAdminRoutes);
app.use("/api/v1/cityAdmin", cityAdminRoutes);
app.use("/api/v1/dept-admin", deptAdminRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1/zones", zoneRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/worker', workerRoutes);

// Catch-all for undefined routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
