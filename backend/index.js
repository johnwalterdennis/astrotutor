require('dotenv').config({ path: '.env' });
console.log('Gemini API URL:', process.env.GEMINI_API_KEY);
// console.log(process.env);
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-very-secure-secret', // CHANGE THIS to an env variable for production
    resave: false,                 // Don't save session if unmodified
    saveUninitialized: true,        // Save new sessions even if empty (we'll store history)
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (requires HTTPS)
      maxAge: 1000 * 60 * 60 * 2 // Example: Cookie lasts 2 hours
    }
    // For production, consider using a persistent session store like connect-redis or connect-mongo
    // store: new RedisStore({ client: redisClient }),
  }));
  

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-very-secure-secret', // CHANGE THIS to an env variable for production
    resave: false,                 // Don't save session if unmodified
    saveUninitialized: true,        // Save new sessions even if empty (we'll store history)
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (requires HTTPS)
      maxAge: 1000 * 60 * 60 * 2 // Example: Cookie lasts 2 hours
    }
    // For production, consider using a persistent session store like connect-redis or connect-mongo
    // store: new RedisStore({ client: redisClient }),
  }));
  
  // --- Your API Route (Modified) ---
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
  
          // --- Initialize or retrieve chat history from session ---
          if (!req.session.chatHistory) {
              // Start history with the initial system prompt/persona instruction
              // Gemini expects alternating user/model roles.
              // We can start with the system prompt as the first 'user' message
              // and optionally add a first 'model' greeting.
              req.session.chatHistory = [
                  {
                      role: "user",
                      parts: [{ text: `You are AstroTutor, an AI tutor inspired by R2-D2. Help the user understand aspects of astronomy in a fun, child-friendly manner. Respond concisely and always end with a friendly R2-D2 sound like 'Beep boop!' or 'Waaaah!'.` }],
                  },
                  {
                      // Optional: Add an initial greeting from the bot
                      role: "model",
                      parts: [{ text: "Beep boop! I'm AstroTutor! Ready to explore the stars? What cosmic question do you have for me? Waaaah!" }],
                  }
              ];
          }
  
          // --- Add the user's current message to the history ---
          req.session.chatHistory.push({
              role: "user",
              parts: [{ text: message }],
          });
  
          // --- Prepare API Request ---
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
          // --- Use the entire chat history as context ---
          const requestBody = {
              contents: req.session.chatHistory,
              // Optional: Add generationConfig if needed
              // generationConfig: {
              //   temperature: 0.7,
              //   maxOutputTokens: 800,
              // }
              // Optional: Safety Settings if needed
              // safetySettings: [ ... ]
          };
  
          // --- Call the API ---
          const apiResponse = await axios.post(apiUrl, requestBody);
  
          // --- Process the Response ---
          const responseData = apiResponse.data;
          let replyText = "Bee-boo-bop... I seem to be having trouble communicating!"; // Default error reply
  
          if (responseData?.candidates?.[0]?.content?.parts?.[0]?.text) {
              replyText = responseData.candidates[0].content.parts[0].text;
  
               // --- Add the AI's response to the history ---
               // Crucially, do this *after* successfully getting the reply
               req.session.chatHistory.push({
                  role: "model",
                  parts: [{ text: replyText }],
              });
  
          } else {
              // Log the unexpected structure for debugging
              console.error('Unexpected API response structure:', JSON.stringify(responseData, null, 2));
               // Don't add the default error reply to the history, but you might want to remove the last user message
               // req.session.chatHistory.pop(); // Optional: remove the user message that failed
               res.status(500).send({ error: 'Failed to parse tutor response from API' });
               return; // Exit early
          }
  
          // --- Send the latest reply back to the client ---
          res.json({ reply: replyText });
  
      } catch (error) {
          console.error('Error calling Gemini API:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
           // Remove the user message that caused the error from history
           if(req.session.chatHistory && req.session.chatHistory.length > 0 && req.session.chatHistory[req.session.chatHistory.length - 1].role === 'user') {
              req.session.chatHistory.pop();
           }
          const status = error.response ? error.response.status : 500;
          res.status(status).send({ error: 'Error retrieving tutor response' });
      }
  });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Back-end server running on port ${PORT}`));