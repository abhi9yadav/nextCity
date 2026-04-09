const multer = require("multer");

const storage = multer.memoryStorage(); // 🔥 important
const upload = multer({ storage });

module.exports = upload;