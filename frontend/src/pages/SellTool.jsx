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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useState, useRef } from "react";
import { db, auth } from "../firebase";
import { addDoc, collection , doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CLOUD_NAME = "dstfo8pxq";
const UPLOAD_PRESET = "unitrade_upload";

export default function SellTool() {
    const fileInputRef = useRef(null);

    /* ================= STATES ================= */

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        university: "",
        condition: "",
        price: "",
    });

    const [images, setImages] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const MAX_FILES = 5;
    const MAX_SIZE_MB = 5;
    // Upload image to Cloudinary and return the URL
    const uploadImage = async (file) => {

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: data
            }
        );

        const result = await res.json();

        return result.secure_url;
    };
    // Upload all images and return their URLs
    const uploadImages = async () => {

        const urls = [];

        for (let img of images) {

            const url = await uploadImage(img.file);

            urls.push(url);

        }

        return urls;
    };

    /* ================= FORM HANDLER ================= */

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    /* ================= IMAGE HANDLING ================= */

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

    /* ================= FAKE UPLOAD ================= */

    const simulateUpload = () => {
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const handleSubmit = async () => {
        if (images.length === 0) {
            setError("Please upload at least one image.");
            return;
        }

        try {

            setUploadProgress(10);

            const imageUrls = await uploadImages();

            setUploadProgress(70);
            const userRef = doc(db, "users", auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            const userName = userSnap.exists() ? userSnap.data().firstName + " " + userSnap.data().lastName : "User";
            await addDoc(collection(db, "products"), {
                title: form.title,
                description: form.description,
                category: form.category,
                university: form.university,
                condition: form.condition,
                price: Number(form.price),
                images: imageUrls,
                userId: auth.currentUser.uid,
                 sellerName: userName,
                createdAt: new Date()
            });

            setUploadProgress(100);

            alert("Product posted successfully");
            navigate("/home");

        } catch (err) {

            console.error(err);
            setError("Error posting item");

        }
    };

    /* ================= UI ================= */

    return (
        <Box sx={{ backgroundColor: "#f5f7fb", minHeight: "100vh", p: 5 }}>
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
                <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 4 }}>
                    Sell Your Item
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* ================= IMAGE UPLOAD ================= */}

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

                {/* ================= IMAGE PREVIEW ================= */}

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

                {/* ================= UPLOAD PROGRESS ================= */}

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

                {/* ================= FORM FIELDS ================= */}

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
                        <MenuItem value="Laptops & Tablets">Laptops & Tablets</MenuItem>
                        <MenuItem value="Engineering Tools">Engineering Tools</MenuItem>
                        <MenuItem value="Medical Tools">Medical Tools</MenuItem>
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
                        <MenuItem value="Alexandria University">Alexandria University</MenuItem>
                        <MenuItem value="Ain Shams">Ain Shams</MenuItem>
                    </Select>
                </FormControl>

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
    );
}