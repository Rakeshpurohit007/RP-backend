// server.js

// This is the secure backend server for the RP Real Estate Evaluator.
// It handles the communication with the Google Gemini API and keeps your API key safe.

// 1. Import necessary libraries
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // Import the CORS middleware

// 2. Initialize the Express application
const app = express();
const port = 3000;

// 3. IMPORTANT: Your API key is stored securely here on the server.
// It is never exposed to the user's browser.
const GEMINI_API_KEY = 'AIzaSyCp5v56a3W-hH3BrDtErXhsDh-wR55oorQ';

// 4. Middleware setup
app.use(express.json()); // Allows the server to understand JSON data
app.use(cors()); // Enable Cross-Origin Resource Sharing for all routes

// 5. Define the API endpoint that the frontend will call
app.post('/api/generate', async (req, res) => {
    // Get the prompt from the frontend's request
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).send('Prompt is required');
    }

    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

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
            throw new Error(`Google API Error: ${geminiResponse.status} ${geminiResponse.statusText}`);
        }

        // Stream the response from Google directly back to the frontend
        res.setHeader('Content-Type', 'text/plain');
        geminiResponse.body.pipe(res);

    } catch (error) {
        console.error('Error calling Google Gemini API:', error);
        res.status(500).send('Failed to get response from AI service.');
    }
});

// 6. Start the server and listen for requests
app.listen(port, () => {
    console.log(`RP Backend Server listening on port ${port}`);
});
