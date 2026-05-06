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
    Skeleton,
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
                university: form.university === "Others" ? customUniversity : form.university,
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
        <>
            <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
                <Navbar />
                {showConfetti && <Confetti width={width} height={height} recycle={false} />}
                <Box sx={{ p: 5 }}>
                    <Box sx={{ maxWidth: 700, mx: "auto", backgroundColor: "background.paper", p: 5, borderRadius: 4, boxShadow: (theme) => theme.palette.mode === 'light' ? "0 10px 30px rgba(0,0,0,0.05)" : "none", border: "1px solid", borderColor: "divider" }}>
                        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>Back</Button>
                        <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 4 }}>Sell Your Item</Typography>
                        
                        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                        <Box 
                            onClick={() => fileInputRef.current.click()}
                            sx={{ border: "2px dashed", borderColor: "primary.main", borderRadius: 3, p: 4, textAlign: "center", cursor: "pointer", mb: 3, backgroundColor: "background.subtle" }}
                        >
                            <CloudUploadIcon sx={{ fontSize: 40, color: "primary.main" }} />
                            <Typography sx={{ mt: 2, fontWeight: 500 }}>Upload Image</Typography>
                            <input type="file" multiple hidden ref={fileInputRef} onChange={(e) => handleFiles(Array.from(e.target.files))} />
                        </Box>

                        {images.length > 0 && (
                            <Box sx={{ display: "flex", gap: 2, mb: 3, overflowX: "auto" }}>
                                {images.map((img, i) => (
                                    <Box key={i} sx={{ position: "relative", minWidth: 100 }}>
                                        <img src={img.preview} alt="preview" style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover" }} />
                                        <IconButton size="small" onClick={() => setImages(images.filter((_, idx) => idx !== i))} sx={{ position: "absolute", top: 0, right: 0, bgcolor: "background.paper" }}><DeleteIcon fontSize="small" /></IconButton>
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

                        {aiLoading ? (
                            <>
                                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 3 }} />
                                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 3 }} />
                                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 3 }} />
                            </>
                        ) : (
                            <>
                                <TextField fullWidth label="Title" name="title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} sx={{ mb: 3 }} />
                                <TextField fullWidth multiline rows={4} label="Description" name="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} sx={{ mb: 3 }} />
                                
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel>University</InputLabel>
                                    <Select 
                                        value={form.university} 
                                        label="University" 
                                        onChange={(e) => setForm({...form, university: e.target.value})}
                                    >
                                        {["Cairo University", "Ain Shams University", "Alexandria University", "Mansoura University", "Assiut University", "Helwan University", "Tanta University", "Zagazig University", "Suez Canal University", "Al-Azhar University", "German University in Cairo", "British University in Egypt", "October 6 University", "Future University in Egypt", "AASTMT", "Nile University", "Others"].map(uni => (
                                            <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {form.university === "Others" && (
                                    <TextField 
                                        fullWidth 
                                        label="Enter University Name" 
                                        value={customUniversity} 
                                        onChange={(e) => setCustomUniversity(e.target.value)} 
                                        sx={{ mb: 3 }} 
                                    />
                                )}

                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel>Category</InputLabel>
                                    <Select value={form.category} label="Category" onChange={(e) => setForm({...form, category: e.target.value})}>
                                        {["Books & Notes", "Calculators", "Electronics", "Engineering Tools", "Medical Tools", "Lab Equipment", "Stationery", "Bags & Accessories"].map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel>Condition</InputLabel>
                                    <Select 
                                        value={form.condition} 
                                        label="Condition" 
                                        onChange={(e) => setForm({...form, condition: e.target.value})}
                                    >
                                        <MenuItem value="New">New</MenuItem>
                                        <MenuItem value="Like New">Like New</MenuItem>
                                        <MenuItem value="Good">Good</MenuItem>
                                        <MenuItem value="Fair">Fair</MenuItem>
                                        <MenuItem value="Poor">Poor</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        )}

                        <TextField fullWidth type="number" label="Price (EGP)" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} sx={{ mb: 3 }} />
                        <TextField fullWidth type="number" label="Available Quantity" value={form.quantityAvailable} onChange={(e) => setForm({...form, quantityAvailable: e.target.value})} sx={{ mb: 3 }} />

                        <Button 
                            fullWidth 
                            variant="contained" 
                            onClick={handleSubmit} 
                            sx={{ 
                                py: 1.8, 
                                borderRadius: 3, 
                                fontWeight: 800,
                                fontSize: '1.05rem',
                                background: (theme) => theme.palette.mode === 'light' 
                                    ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                                    : "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                                boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 12px 25px rgba(37,99,235,0.3)",
                                    background: (theme) => theme.palette.mode === 'light' 
                                        ? "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)"
                                        : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                                }
                            }}
                        >
                            Post Item
                        </Button>
                    </Box>
                </Box>
                <Footer />
                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
                    <Alert severity="success" variant="filled">{snackbar.message}</Alert>
                </Snackbar>
            </Box>
        </>
    );
}