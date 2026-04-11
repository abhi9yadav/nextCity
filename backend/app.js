const helmet = require("helmet");
const path = require("path");

const express = require("express");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const superAdminRoutes = require("./routes/superAdminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const rootDir = require("./utils/rootDir");
const authRoutes = require("./routes/authRoutes");
const cityAdminRoutes = require("./routes/cityAdminRoutes");
const zoneRoutes = require("./routes/zoneRoutes");
const workerRoutes = require("./routes/workerRoutes");
const deptAdminRoutes = require("./routes/deptAdminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const landingPageRoutes = require("./routes/landingPageRoutes");

const app = express();

app.use(helmet());

// Middlewares
app.use(express.static(path.join(rootDir, "public")));
app.use(
  cors({
    origin: ["https://nextcity1.onrender.com", process.env.CLIENT_URL],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("json spaces", 2);
app.set("trust proxy", 1);

// Routes
app.use("/api/v1/users", authRoutes);
app.use("/api/v1/superAdmin", superAdminRoutes);
app.use("/api/v1/cityAdmin", cityAdminRoutes);
app.use("/api/v1/dept-admin", deptAdminRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1/zones", zoneRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/worker", workerRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/landingPage", landingPageRoutes);

// Catch-all for undefined routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
