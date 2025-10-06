const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/authRoute");
const superAdminRoutes = require("./routes/superAdminRoute");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
console.log("Setting up routes...");
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/superAdmin", superAdminRoutes);
app.use("/api/v1/complaints", complaintRoutes);

module.exports = app;
