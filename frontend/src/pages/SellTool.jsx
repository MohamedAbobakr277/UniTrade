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
import { useState, useRef } from "react";
import { db, auth } from "../firebase";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const CLOUD_NAME = "dstfo8pxq";
const UPLOAD_PRESET = "unitrade_upload";

export default function SellTool() {
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        university: "",
        condition: "",
        price: "",
    });

    const [images, setImages] = useState([]);
    const [customUniversity, setCustomUniversity] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });
    const { width, height } = useWindowSize();
    const navigate = useNavigate();

    const MAX_FILES = 5;
    const MAX_SIZE_MB = 5;

    const uploadImage = async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: data,
            }
        );

        const result = await res.json();
        return result.secure_url;
    };

    const uploadImages = async () => {
        const urls = [];
        for (let img of images) {
            const url = await uploadImage(img.file);
            urls.push(url);
        }
        return urls;
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

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

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(Array.from(e.dataTransfer.files));
    };

    const handleRemove = (index) => {
        const updated = [...images];
        updated.splice(index, 1);
        setImages(updated);
    };

    const handleSubmit = async () => {
        if (images.length === 0) {
            setError("Please upload at least one image.");
            return;
        }

        try {
            setUploadProgress(10);

            // 🔥 رفع الصور
            const imageUrls = await uploadImages();

            setUploadProgress(70);

            // 🔥 بيانات اليوزر
            const userRef = doc(db, "users", auth.currentUser.uid);
            const userSnap = await getDoc(userRef);

            let userName = "User";
            let userPhoto = "";

            if (userSnap.exists()) {
                const data = userSnap.data();
                userName = data.firstName + " " + data.lastName;
                userPhoto = data.photo || "";
            }

            // 🔥 إضافة المنتج + الحالة الجديدة
            await addDoc(collection(db, "products"), {
                title: form.title,
                description: form.description,
                category: form.category,
                university: form.university === "Others" ? customUniversity : form.university,
                condition: form.condition,
                price: Number(form.price),
                images: imageUrls,
                userId: auth.currentUser.uid,
                sellerName: userName,
                sellerPhoto: userPhoto,
                status: "available", // ✅ أهم تعديل
                createdAt: new Date(),
            });

            setUploadProgress(100);

            // Show confetti and success message
            setShowConfetti(true);
            setSnackbar({ open: true, message: "Item posted successfully! 🎉" });
            
            setTimeout(() => {
                setShowConfetti(false);
                navigate("/home");
            }, 3000);
        } catch (err) {
            console.error(err);
            setError("Error posting item");
        }
    };

    return (
        <Box sx={{ backgroundColor: "#f5f7fb", minHeight: "100vh" }}>
            <Navbar />
            
            {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} />}

            <Box sx={{ p: 5 }}>
            <Box
                sx={{
                    maxWidth: 700,
                    mx: "auto",
                    backgroundColor: "white",
                    p: 5,
                    borderRadius: 4,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                }}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        mb: 3,
                        textTransform: "none",
                        fontWeight: 700,
                        color: "#64748b",
                        bgcolor: "#f8fafc",
                        px: 2.5,
                        py: 0.8,
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        transition: "all 0.2s ease",
                        "&:hover": {
                            bgcolor: "#e2e8f0",
                            color: "#0f172a",
                            transform: "translateX(-4px)",
                        },
                    }}
                >
                    Back
                </Button>

                <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 4 }}>
                    Sell Your Item
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current.click()}
                    sx={{
                        border: "2px dashed #2563eb",
                        borderRadius: 3,
                        p: 4,
                        textAlign: "center",
                        cursor: "pointer",
                        mb: 3,
                        backgroundColor: "#f8fafc",
                    }}
                >
                    <CloudUploadIcon sx={{ fontSize: 40, color: "#2563eb" }} />
                    <Typography sx={{ mt: 2, fontWeight: 500 }}>
                        Drag & Drop Images Here
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "gray" }}>
                        Max 5 images — Max 5MB each
                    </Typography>

                    <input
                        type="file"
                        multiple
                        hidden
                        ref={fileInputRef}
                        onChange={(e) =>
                            handleFiles(Array.from(e.target.files))
                        }
                    />
                </Box>

                {images.length > 0 && (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(120px, 1fr))",
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        {images.map((img, index) => (
                            <Box key={index} sx={{ position: "relative" }}>
                                <img
                                    src={img.preview}
                                    alt="preview"
                                    style={{
                                        width: "100%",
                                        height: "120px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                    }}
                                />

                                <IconButton
                                    size="small"
                                    onClick={() => handleRemove(index)}
                                    sx={{
                                        position: "absolute",
                                        top: 5,
                                        right: 5,
                                        backgroundColor: "white",
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}

                {uploadProgress > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <LinearProgress
                            variant="determinate"
                            value={uploadProgress}
                        />
                        <Typography sx={{ mt: 1, fontSize: 14 }}>
                            Uploading... {uploadProgress}%
                        </Typography>
                    </Box>
                )}

                <TextField
                    fullWidth
                    label="Tool Title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    sx={{ mb: 3 }}
                />

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    sx={{ mb: 3 }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                    >
                        <MenuItem value="Books & Notes">Books & Notes</MenuItem>
                        <MenuItem value="Calculators">Calculators</MenuItem>
                        <MenuItem value="Electronics">Electronics</MenuItem>
                        <MenuItem value="Engineering Tools">Engineering Tools</MenuItem>
                        <MenuItem value="Medical Tools">Medical Tools</MenuItem>
                        <MenuItem value="Lab Equipment">Lab Equipment</MenuItem>
                        <MenuItem value="Stationery">Stationery</MenuItem>
                        <MenuItem value="Bags & Accessories">Bags & Accessories</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>University</InputLabel>
                    <Select
                        name="university"
                        value={form.university}
                        onChange={handleChange}
                    >
                        <MenuItem value="Cairo University">Cairo University</MenuItem>
                        <MenuItem value="Ain Shams University">Ain Shams University</MenuItem>
                        <MenuItem value="Alexandria University">Alexandria University</MenuItem>
                        <MenuItem value="Mansoura University">Mansoura University</MenuItem>
                        <MenuItem value="Assiut University">Assiut University</MenuItem>
                        <MenuItem value="Helwan University">Helwan University</MenuItem>
                        <MenuItem value="Tanta University">Tanta University</MenuItem>
                        <MenuItem value="Zagazig University">Zagazig University</MenuItem>
                        <MenuItem value="Suez Canal University">Suez Canal University</MenuItem>
                        <MenuItem value="Al-Azhar University">Al-Azhar University</MenuItem>
                        <MenuItem value="German University in Cairo">German University in Cairo</MenuItem>
                        <MenuItem value="British University in Egypt">British University in Egypt</MenuItem>
                        <MenuItem value="October 6 University">October 6 University</MenuItem>
                        <MenuItem value="Future University in Egypt">Future University in Egypt</MenuItem>
                        <MenuItem value="AASTMT">AASTMT</MenuItem>
                        <MenuItem value="Nile University">Nile University</MenuItem>
                        <MenuItem value="Others">Others</MenuItem>
                    </Select>
                </FormControl>

                {form.university === "Others" && (
                    <TextField
                        fullWidth
                        label="Enter Your University"
                        value={customUniversity}
                        onChange={(e) => setCustomUniversity(e.target.value)}
                        sx={{ mb: 3 }}
                    />
                )}

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Condition</InputLabel>
                    <Select
                        name="condition"
                        value={form.condition}
                        onChange={handleChange}
                    >
                        <MenuItem value="New">New</MenuItem>
                        <MenuItem value="Like New">Like New</MenuItem>
                        <MenuItem value="Good">Good</MenuItem>
                        <MenuItem value="Fair">Fair</MenuItem>
                        <MenuItem value="Poor">Poor</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    type="number"
                    label="Price (EGP)"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    sx={{ mb: 4 }}
                />

                <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        backgroundColor: "#2563eb",
                        "&:hover": { backgroundColor: "#1e40af" },
                    }}
                    onClick={handleSubmit}
                >
                    Post Item
                </Button>
            </Box>
            </Box>
            <Footer />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity="success" 
                    variant="filled"
                    sx={{ width: '100%', borderRadius: '12px', fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}