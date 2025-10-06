// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const userRoutes = require("./routes/authRoute");
// const superAdminRoutes = require("./routes/superAdminRoute");
// require("dotenv").config();



// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // Connect MongoDB
// const DB = process.env.DATABASE_URL
//   .replace('<USERNAME>', process.env.DATABASE_USER)
//   .replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

// // Routes
// console.log("Setting up routes...");
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/superAdmin", superAdminRoutes);

// app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
