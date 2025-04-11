require('dotenv').config;
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/tutor', async (req, res) => {
    try {
      const { message } = req.body;
      const prompt = `You are AstroTutor, an AI tutor inspired by R2-D2. Help the user understand aspects of astronomy in a fun, child-friendly manner. The user asked: "${message}"`;
  
      const apiResponse = await axios.post(
        GEMINI_API_KEY, // Change to the actual Gemini API endpoint
        { prompt },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      res.json({ reply: apiResponse.data.reply });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).send({ error: 'Error retrieving tutor response' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Back-end server running on port ${PORT}`));