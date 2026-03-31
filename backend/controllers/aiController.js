const axios = require('axios');

/**
 * Controller to handle AI analysis of a complaint image using Gemini.
 */
const geminiAnalyze = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key is not configured on the server.' });
        }
        
        // ✅ FIXED MODEL HERE
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const base64ImageData = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        const userPrompt = `Analyze the attached image which depicts a civic issue. Your task is to act as a helpful assistant for a citizen filing a complaint.
        1. Identify the main problem in the image.
        2. Determine the most relevant municipal department from:
        'Department of Power Supply', 'Department of Water Management', 'Department of Roads and Infrastructure',
        'Department of Sanitation and Waste Management', 'Department of Drainage and Sewage',
        'Department of Parks and Green Spaces', 'Department of Public Health', 'Department of General Services'.
        3. Create a concise title.
        4. Write a short description.

        Return ONLY a JSON object with keys: "department", "title", "description".`;

        const payload = {
            contents: [{
                parts: [
                    { text: userPrompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64ImageData
                        }
                    }
                ]
            }]
        };

        const response = await axios.post(apiUrl, payload);

        const candidate = response.data.candidates?.[0];
        if (!candidate || !candidate.content?.parts?.[0]?.text) {
            throw new Error("Invalid response structure from AI.");
        }

        let jsonString = candidate.content.parts[0].text.trim();

        // Clean markdown if present
        jsonString = jsonString.replace(/```json|```/g, '');

        const analysisResult = JSON.parse(jsonString);

        res.status(200).json({
            title: analysisResult.title,
            description: analysisResult.description,
            department: analysisResult.department
        });

    } catch (error) {
        console.error("Error during AI analysis:", error.response?.data || error.message);

        res.status(500).json({
            error: error.response?.data || 'Failed to analyze image with AI.'
        });
    }
};

module.exports = {
    geminiAnalyze,
};