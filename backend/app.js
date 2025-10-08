const dotenv = require("dotenv");
const path = require("path");
const rootDir = require('./utils/rootDir');

dotenv.config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRoutes = require("./routes/authRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

// Middlewares
app.use(express.static(path.join(rootDir, 'public')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form submissions
app.set('json spaces', 2); // nicely formatted JSON responses

// Routes
console.log("Setting up routes...");
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/superAdmin", superAdminRoutes);
app.use("/api/v1/complaints", complaintRoutes);

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
