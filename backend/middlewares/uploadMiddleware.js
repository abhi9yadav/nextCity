const multer = require("multer");

const storage = multer.memoryStorage(); // keeps file in memory
const upload = multer({ storage });

module.exports = upload;
