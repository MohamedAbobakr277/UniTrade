const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const rateLimit = require('express-rate-limit');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');

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

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase initialized with Service Account from ENV");
    } catch (e) {
        console.log("Failed to parse FIREBASE_SERVICE_ACCOUNT, trying local file...");
        admin.initializeApp({
            credential: admin.credential.cert(require('./serviceAccount.json'))
        });
    }
} else {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'unitrade-cc943'
    });
    console.log("Firebase initialized with Project ID (Default credentials)");
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
});

// Setup Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Anthropic
let anthropic = null;
const getAnthropic = () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    if (!anthropic) anthropic = new Anthropic({ apiKey });
    return anthropic;
};

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

// Route: Upload Image to Cloudinary
app.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'unitrade_upload',
            folder: 'unitrade_products'
        });
        res.json({ secure_url: uploadResponse.secure_url });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Upload failed", message: error.message });
    }
});

// Route: AI Similar Items (Anthropic Proxy)
app.post('/recommend', authenticateUser, async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });
        const anthropicClient = getAnthropic();
        const response = await anthropicClient.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
        });
        const text = response.content.find(c => c.type === 'text')?.text || "[]";
        res.json({ text });
    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(500).json({ error: "Recommendation failed", message: error.message });
    }
});

// Route: Chatbot (Existing Feature - Unmodified)
app.post('/chat', authenticateUser, chatLimiter, async (req, res) => {
    try {
        const { chatHistory } = req.body;
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

// Route: Create/Update Product
app.post('/products', authenticateUser, async (req, res) => {
    try {
        const productData = req.body;
        const db = admin.firestore();
        productData.userId = req.user.uid;
        productData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        const docRef = await db.collection('products').add(productData);
        res.json({ id: docRef.id, ...productData });
    } catch (error) {
        console.error("Product Creation Error:", error);
        res.status(500).json({ error: "Failed to create product", message: error.message });
    }
});

// Route: Update User Profile
app.post('/profile', authenticateUser, async (req, res) => {
    try {
        const updateData = req.body;
        const db = admin.firestore();
        await db.collection('users').doc(req.user.uid).update(updateData);
        res.json({ success: true });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ error: "Failed to update profile", message: error.message });
    }
});

// Route: Update Product (e.g. mark as sold)
app.patch('/products/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const db = admin.firestore();

        // Verify ownership
        const productRef = db.collection('products').doc(id);
        const doc = await productRef.get();
        if (!doc.exists) return res.status(404).json({ error: "Product not found" });
        if (doc.data().userId !== req.user.uid) return res.status(403).json({ error: "Forbidden: Not your product" });

        await productRef.update(updateData);
        res.json({ success: true });
    } catch (error) {
        console.error("Product Update Error:", error);
        res.status(500).json({ error: "Failed to update product", message: error.message });
    }
});

// Route: Toggle Favorite
app.post('/favorites', authenticateUser, async (req, res) => {
    try {
        const { productId, action } = req.body; // action: 'add' or 'remove'
        if (!productId) return res.status(400).json({ error: "productId is required" });

        const db = admin.firestore();
        const userRef = db.collection('users').doc(req.user.uid);

        if (action === 'remove') {
            await userRef.update({
                favorites: admin.firestore.FieldValue.arrayRemove(productId)
            });
        } else {
            await userRef.update({
                favorites: admin.firestore.FieldValue.arrayUnion(productId)
            });
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Favorite Error:", error);
        res.status(500).json({ error: "Failed to update favorite", message: error.message });
    }
});

// Route: Send Notification
app.post('/notifications', authenticateUser, async (req, res) => {
    try {
        const { targetUserId, type, message, link } = req.body;
        if (!targetUserId) return res.status(400).json({ error: "targetUserId is required" });
        const db = admin.firestore();
        await db.collection('users').doc(targetUserId).collection('notifications').add({
            type,
            message,
            link,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true });
    } catch (error) {
        console.error("Notification Error:", error);
        res.status(500).json({ error: "Failed to send notification", message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`UniTrade Backend Securely running on port ${PORT}`);
});

module.exports = app;
