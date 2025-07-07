// server.js

// Secure backend server for RP Real Estate Evaluator
// It safely connects to Google Gemini API

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // ? Render compatible

// API key stored in environment variable (safer for Render)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());
app.use(cors());

// API endpoint for frontend
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).send('Prompt is required');
    }

    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

    try {
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

        res.setHeader('Content-Type', 'text/plain');
        geminiResponse.body.pipe(res);

    } catch (error) {
        console.error('Error calling Google Gemini API:', error);
        res.status(500).send('Failed to get response from AI service.');
    }
});

app.listen(port, () => {
    console.log(`RP Backend Server is running on port ${port}`);
});
