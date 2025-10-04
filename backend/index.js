const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/authRoute");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect MongoDB
mongoose
  .connect("mongodb+srv://abhiacb94_db_user:Ktw1JHXYvUVU6cO6@mycluster.2va68x5.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Routes
console.log("Setting up routes...");
app.use("/api/v1/users", userRoutes);

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
