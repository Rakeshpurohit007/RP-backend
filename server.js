// server.js

// This is the secure backend server for the RP Real Estate Evaluator.
// It handles the communication with the Google Gemini API and keeps your API key safe.

// 1. Import necessary libraries
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // Import the CORS middleware

// 2. Initialize the Express application
const app = express();
// **MODIFIED: Use Render's port or fallback to 3000 for local testing**
const port = process.env.PORT || 3000;

// 3. **MODIFIED: Securely read the API key from environment variables**
// This is the industry-standard best practice.
// It reads the key you set in Render.com without exposing it in the code.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Add a check to ensure the API key is available
if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable not set.");
    process.exit(1); // Exit the process with an error code
}

// 4. Middleware setup
app.use(cors()); // This allows requests from any origin.
app.use(express.json()); // Allows the server to understand JSON data

// 5. Define the API endpoint that the frontend will call
app.post('/api/generate', async (req, res) => {
    // Get the prompt from the frontend's request
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).send('Prompt is required');
    }

    // Use the non-streaming endpoint as per our last update
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;

    try {
        // Make the secure call to the Google Gemini API from the server
        const geminiResponse = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            throw new Error(`Google API Error: ${geminiResponse.status} ${geminiResponse.statusText} - ${errorText}`);
        }

        const data = await geminiResponse.json();
        res.json(data);

    } catch (error) {
        console.error('Error calling Google Gemini API:', error);
        res.status(500).send('Failed to get response from AI service.');
    }
});

// 6. Start the server and listen for requests
app.listen(port, () => {
    console.log(`RP Backend Server listening on port ${port}`);
});
