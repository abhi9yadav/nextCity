const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/authRoute");
require("dotenv").config();



const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect MongoDB
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Routes
console.log("Setting up routes...");
app.use("/api/v1/users", userRoutes);

app.listen(process.env.PORT, () => console.log("🚀 Server running on port 5000"));
