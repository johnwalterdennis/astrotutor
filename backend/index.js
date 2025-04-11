require('dotenv').config({ path: '../.env' });
// console.log('Gemini API URL:', process.env.GEMINI_API_KEY);
// console.log(process.env);
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());



app.post('/api/tutor', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).send({ error: 'Message is required' });
        }
        if (!process.env.GEMINI_API_KEY) {
             console.error('GEMINI_API_KEY environment variable not set.');
             return res.status(500).send({ error: 'Server configuration error' });
        }

        const prompt = `You are AstroTutor, an AI tutor inspired by R2-D2. Help the user understand aspects of astronomy in a fun, child-friendly manner. The user asked: "${message}"`;

        // --- FIX 1: Correct API Endpoint URL (using API Key) ---
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`; // Adjust model if needed

        // --- FIX 2: Correct Request Body Structure ---
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
            // Optional: Add generationConfig if needed
            // generationConfig: {
            //   temperature: 0.7,
            //   maxOutputTokens: 800, // Example
            // }
        };

        // --- FIX 3: Removed incorrect Authorization header ---
        // Axios automatically sets Content-Type: application/json when data is an object
        const apiResponse = await axios.post(apiUrl, requestBody);

        // --- FIX 4: Correct Response Data Access with checks ---
        const responseData = apiResponse.data;
        if (responseData && responseData.candidates && responseData.candidates.length > 0 &&
            responseData.candidates[0].content && responseData.candidates[0].content.parts &&
            responseData.candidates[0].content.parts.length > 0 &&
            responseData.candidates[0].content.parts[0].text) {

            const replyText = responseData.candidates[0].content.parts[0].text;
            res.json({ reply: replyText });
        } else {
            // Log the actual response for debugging if structure is wrong
            console.error('Unexpected API response structure:', JSON.stringify(responseData, null, 2));
            res.status(500).send({ error: 'Failed to parse tutor response from API' });
        }

    } catch (error) {
        // Log more detailed error information if available
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        // Send appropriate status code if possible (e.g., from error.response.status)
        const status = error.response ? error.response.status : 500;
        res.status(status).send({ error: 'Error retrieving tutor response' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Back-end server running on port ${PORT}`));