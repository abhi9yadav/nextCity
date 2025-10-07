const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/authRoutes")
const complaintRoutes = require("./routes/complaintRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const zoneRoutes = require("./routes/zoneRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
console.log("Setting up routes...");
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/superAdmin", superAdminRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1/zones", zoneRoutes);

module.exports = app;
