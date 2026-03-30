const express = require('express');
const router = express.Router();

// Import the controller function
const { geminiAnalyze } = require('../controllers/aiController');
// Import the file upload middleware
const upload = require('../middlewares/uploadMiddleware');

// Define the route for AI analysis, matching the frontend request
// POST /api/v1/ai/gemini-analyze
// The 'upload.single('file')' middleware processes the upload with the field name 'file'.
router.post('/gemini-analyze', upload.single('file'), geminiAnalyze);

module.exports = router;
