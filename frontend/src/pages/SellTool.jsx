import {
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    LinearProgress,
    Alert,
    Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useState, useRef } from "react";
import { uploadToCloudinary, analyzeWithAI } from "../services/aiImageAnalyzer";
import { db, auth } from "../firebase";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function SellTool() {
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        university: "",
        condition: "",
        price: "",
        quantityAvailable: "",
    });

    const [images, setImages] = useState([]);
    const [customUniversity, setCustomUniversity] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });
    const { width, height } = useWindowSize();
    const navigate = useNavigate();

    const MAX_FILES = 5;
    const MAX_SIZE_MB = 5;

    const handleFiles = (files) => {
        setError("");
        if (images.length + files.length > MAX_FILES) {
            setError(`Maximum ${MAX_FILES} images allowed.`);
            return;
        }
        const newImages = [];
        for (let file of files) {
            if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
                setError("Each image must be under 5MB.");
                return;
            }
            newImages.push({
                file,
                preview: URL.createObjectURL(file),
            });
        }
        setImages((prev) => [...prev, ...newImages]);
    };

    const handleGenerateAI = async () => {
        if (images.length === 0) {
            setError("Please upload an image first.");
            return;
        }
        setAiLoading(true);
        setError("");
        try {
            const file = images[0].file;
            const imageUrl = await uploadToCloudinary(file);
            
            const prompt = `
                You are an AI assistant for UNITRADE, a university student marketplace.
                Analyze this product image and generate details in JSON format:
                {
                  "title": "Clear concise product name",
                  "category": "One of: Books & Notes, Calculators, Electronics, Engineering Tools, Medical Tools, Lab Equipment, Stationery, Bags & Accessories",
                  "description": "Short student-friendly description"
                }
                Output ONLY JSON.
            `;

            const data = await analyzeWithAI(prompt, imageUrl);
            
            if (data) {
                setForm(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    description: data.description || prev.description,
                    category: data.category || prev.category
                }));
                setSnackbar({ open: true, message: "AI generated product details! ✨" });
            }
        } catch (err) {
            console.error("AI Error:", err);
            setError("Failed to analyze image. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (images.length === 0) {
            setError("Please upload at least one image.");
            return;
        }
        try {
            setUploadProgress(10);
            const imageUrls = [];
            for (let img of images) {
                const url = await uploadToCloudinary(img.file);
                imageUrls.push(url);
            }
            setUploadProgress(70);

            const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
            let userData = userSnap.exists() ? userSnap.data() : {};

            await addDoc(collection(db, "products"), {
                ...form,
                price: Number(form.price),
                quantityAvailable: parseInt(form.quantityAvailable),
                images: imageUrls,
                userId: auth.currentUser.uid,
                sellerName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || "User",
                sellerPhoto: userData.photo || "",
                status: "available",
                createdAt: serverTimestamp(),
            });

            setUploadProgress(100);
            setShowConfetti(true);
            setSnackbar({ open: true, message: "Item posted successfully! 🎉" });
            setTimeout(() => navigate("/home"), 3000);
        } catch (err) {
            console.error(err);
            setError("Error posting item");
        }
    };

    return (
        <Box sx={{ backgroundColor: "#f5f7fb", minHeight: "100vh" }}>
            <Navbar />
            {showConfetti && <Confetti width={width} height={height} recycle={false} />}
            <Box sx={{ p: 5 }}>
                <Box sx={{ maxWidth: 700, mx: "auto", backgroundColor: "white", p: 5, borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>Back</Button>
                    <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 4 }}>Sell Your Item</Typography>
                    
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Box 
                        onClick={() => fileInputRef.current.click()}
                        sx={{ border: "2px dashed #2563eb", borderRadius: 3, p: 4, textAlign: "center", cursor: "pointer", mb: 3, backgroundColor: "#f8fafc" }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 40, color: "#2563eb" }} />
                        <Typography sx={{ mt: 2, fontWeight: 500 }}>Upload Image</Typography>
                        <input type="file" multiple hidden ref={fileInputRef} onChange={(e) => handleFiles(Array.from(e.target.files))} />
                    </Box>

                    {images.length > 0 && (
                        <Box sx={{ display: "flex", gap: 2, mb: 3, overflowX: "auto" }}>
                            {images.map((img, i) => (
                                <Box key={i} sx={{ position: "relative", minWidth: 100 }}>
                                    <img src={img.preview} alt="preview" style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover" }} />
                                    <IconButton size="small" onClick={() => setImages(images.filter((_, idx) => idx !== i))} sx={{ position: "absolute", top: 0, right: 0, bgcolor: "white" }}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {images.length > 0 && (
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<AutoFixHighIcon />}
                            onClick={handleGenerateAI}
                            disabled={aiLoading}
                            sx={{ mb: 4, py: 1.5, borderRadius: 3, fontWeight: 600 }}
                        >
                            {aiLoading ? "Analyzing Image..." : "Generate Details from Image"}
                        </Button>
                    )}

                    {aiLoading && <LinearProgress sx={{ mb: 3 }} />}

                    <TextField fullWidth label="Title" name="title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} sx={{ mb: 3 }} />
                    <TextField fullWidth multiline rows={4} label="Description" name="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} sx={{ mb: 3 }} />
                    
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Category</InputLabel>
                        <Select value={form.category} label="Category" onChange={(e) => setForm({...form, category: e.target.value})}>
                            {["Books & Notes", "Calculators", "Electronics", "Engineering Tools", "Medical Tools", "Lab Equipment", "Stationery", "Bags & Accessories"].map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <TextField fullWidth type="number" label="Price (EGP)" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} sx={{ mb: 3 }} />
                    <TextField fullWidth type="number" label="Available Quantity" value={form.quantityAvailable} onChange={(e) => setForm({...form, quantityAvailable: e.target.value})} sx={{ mb: 3 }} />

                    <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ py: 1.5, borderRadius: 3, bgcolor: "#2563eb" }}>Post Item</Button>
                </Box>
            </Box>
            <Footer />
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity="success" variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}