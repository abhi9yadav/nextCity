const express = require("express");
const router = express.Router();
const cache = require("../middleware/cache");
const { getPostById } = require("../controllers/postController");

router.get("/post/:id", cache("post:"), getPostById);

module.exports = router;
