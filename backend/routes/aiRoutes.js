const express = require('express');
const router = express.Router();
const {  authenticate } = require("../middlewares/firebaseAuthRoleMiddleware");
const { chatWithAI } = require("../controllers/aiController");
const { geminiAnalyze } = require('../controllers/aiController');

const upload = require('../middlewares/uploadMiddleware');

router.post('/gemini-analyze', upload.single('file'), geminiAnalyze);

router.post(
    "/chat",
    authenticate,
    chatWithAI
);

module.exports = router;
