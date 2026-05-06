import { auth } from "../firebase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads an image to Cloudinary using an unsigned preset
 * @param {File} file 
 * @returns {Promise<string>} Secure URL
 */
export const uploadToCloudinary = async (file) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Cloudinary config missing in .env");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Cloudinary Error: ${err.error?.message || 'Upload failed'}`);
    }

    const data = await res.json();
    return data.secure_url;
};

/**
 * Sends a prompt and optional image URL to the backend
 * @param {string} prompt 
 * @param {string} imageUrl 
 * @returns {Promise<Object>} AI Response
 */
export const analyzeWithAI = async (prompt, imageUrl = null) => {
    // Get current user's ID token for authentication
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

    const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ prompt, imageUrl })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || "Backend AI Request Failed");
    }

    const data = await res.json();
    
    // Attempt to parse text as JSON if the prompt asked for it
    try {
        const jsonMatch = data.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.warn("Could not parse AI response as JSON, returning raw text.");
    }

    return data;
};
