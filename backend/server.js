const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Simple in-memory cache
const cache = new Map();

// Initialize Gemini AI
let genAI = null;
const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
};

// Helper: Convert image URL to base64 for Gemini
async function fetchImageAsBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        return {
            inlineData: {
                data: Buffer.from(buffer).toString('base64'),
                mimeType: contentType
            }
        };
    } catch (error) {
        console.error("Error fetching image:", error);
        throw new Error("Invalid image URL or failed to fetch image");
    }
}

// Route: Chatbot (Existing Feature - Unmodified)
app.post('/chat', async (req, res) => {
    try {
        const { chatHistory } = req.body;
        const genAI = getGenAI();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: chatHistory })
        });
        const data = await response.json();
        if (data.error) return res.status(400).json({ error: data.error.message });
        res.json(data);
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to connect to AI service" });
    }
});

// Route: NEW AI Image/Product Analyzer
app.post('/generate', async (req, res) => {
    try {
        const { prompt, imageUrl } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        // Caching Logic
        const cacheKey = imageUrl ? `${imageUrl}-${prompt}` : prompt;
        if (cache.has(cacheKey)) {
            console.log("Cache hit!");
            return res.json(cache.get(cacheKey));
        }

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let content;
        if (imageUrl) {
            const imagePart = await fetchImageAsBase64(imageUrl);
            content = [prompt, imagePart];
        } else {
            content = [prompt];
        }

        console.log("Calling Gemini API...");
        const result = await model.generateContent(content);
        const response = await result.response;
        const text = response.text();

        const aiResponse = { text };
        
        // Save to cache
        cache.set(cacheKey, aiResponse);
        if (cache.size > 100) cache.delete(cache.keys().next().value); // Basic limit

        res.json(aiResponse);
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ 
            error: "AI analysis failed", 
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`UniTrade Backend Securely running on port ${PORT}`);
});
