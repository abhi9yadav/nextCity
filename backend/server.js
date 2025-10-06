const mongoose = require("mongoose");
const dotenv = require("dotenv");
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

