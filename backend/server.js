const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const rateLimit = require('express-rate-limit');

dotenv.config();

// Initialize Firebase Admin
// If you have a service account JSON, you can initialize it properly here.
// For now, it will use default credentials or project ID.
// Add fetch polyfill for older node versions just in case
if (!globalThis.fetch) {
    const nodeFetch = require('node-fetch');
    globalThis.fetch = nodeFetch;
    globalThis.Headers = nodeFetch.Headers;
    globalThis.Request = nodeFetch.Request;
    globalThis.Response = nodeFetch.Response;
}

admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'unitrade-cc943'
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting for chat endpoint (per user)
const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute per user
    keyGenerator: (req) => req.user?.uid || req.ip,
    message: { error: "Too many messages. Please wait a moment before trying again." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth Middleware: Verify Firebase ID Token
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Auth Error:", error.message);
        res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
};

// Simple in-memory cache
const cache = new Map();

// Initialize Gemini AI
let genAI = null;
const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    if (!genAI) genAI = new GoogleGenerativeAI(apiKey); // Defaults to v1beta
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
app.post('/chat', authenticateUser, chatLimiter, async (req, res) => {
    try {
        const { chatHistory } = req.body;
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Call the SDK instead of manual fetch
        const result = await model.generateContent({ contents: chatHistory });
        const response = await result.response;

        // Return the response object (the SDK response is compatible with what the frontend expects)
        res.json(response);
    } catch (error) {
        console.error("Chat Error Detail:", {
            message: error.message,
            stack: error.stack,
            status: error.status,
            name: error.name
        });
        res.status(500).json({ error: "Failed to connect to AI service", message: error.message });
    }
});

// Route: NEW AI Image/Product Analyzer
app.post('/generate', authenticateUser, async (req, res) => {
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let content;
        if (imageUrl) {
            console.log("Fetching image from:", imageUrl);
            const imagePart = await fetchImageAsBase64(imageUrl);
            console.log("Image fetched and converted successfully.");
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
        console.error("AI Error Detail:", {
            message: error.message,
            stack: error.stack,
            status: error.status,
            name: error.name
        });
        res.status(500).json({
            error: "AI analysis failed",
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`UniTrade Backend Securely running on port ${PORT}`);
});

module.exports = app;
