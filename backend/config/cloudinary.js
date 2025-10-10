const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config();

module.exports = cloudinary;