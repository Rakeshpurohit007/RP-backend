const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContentStream(prompt);

    res.setHeader('Content-Type', 'text/plain');

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(chunkText);
      }
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while generating content.');
  }
});

const port = process.env.PORT;  // ✅ Correct line for Render (NO default port)
app.listen(port, () => {
  console.log(`RP Backend Server is running on port ${port}`);
});
