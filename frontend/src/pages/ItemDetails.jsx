import {
    Box,
    Typography,
    Paper,
    Chip,
    Avatar,
    Divider,
    Button,
    Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [sellerData, setSellerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const itemRef = doc(db, "products", id);
                const itemSnap = await getDoc(itemRef);

                if (itemSnap.exists()) {
                    const itemData = { id: itemSnap.id, ...itemSnap.data() };
                    setItem(itemData);

                    if (itemData.userId) {
                        const userRef = doc(db, "users", itemData.userId);
                        const userSnap = await getDoc(userRef);
                        setSellerData(userSnap.exists() ? userSnap.data() : {});
                    }
                } else {
                    setItem(null);
                }
            } catch (error) {
                console.error("Error fetching item details:", error);
                setItem(null);
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
                <Navbar />
                <Box sx={{ p: 5 }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                        Loading item details...
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (!item) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
                <Navbar />
                <Box sx={{ p: 5 }}>
                    <Typography sx={{ fontSize: 26, fontWeight: 800, mb: 2 }}>
                        Item not found
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/")}
                        sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            fontWeight: 700,
                        }}
                    >
                        Back to Home
                    </Button>
                </Box>
            </Box>
        );
    }

    const imageUrl =
        Array.isArray(item.images) && item.images.length > 0
            ? item.images[0]
            : item.image || "https://via.placeholder.com/700x450?text=No+Image";

    const formattedDate = item.createdAt
        ? new Date(item.createdAt.seconds * 1000).toLocaleString()
        : "Just now";

    const sellerName =
        item.sellerName ||
        sellerData?.name ||
        sellerData?.fullName ||
        "Unknown Seller";

    const conditionColor =
        item.condition === "New"
            ? "#16a34a"
            : item.condition === "Like New"
                ? "#2563eb"
                : "#f59e0b";

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background:
                    "linear-gradient(180deg, #f8fbff 0%, #f5f7fb 35%, #eef4ff 100%)",
            }}
        >
            <Navbar />

            <Box sx={{ px: { xs: 2, md: 5 }, py: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/")}
                    sx={{
                        mb: 3,
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: "12px",
                        color: "#1d4ed8",
                    }}
                >
                    Back to Listings
                </Button>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: "24px",
                                overflow: "hidden",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#fff",
                            }}
                        >
                            <Box
                                component="img"
                                src={imageUrl}
                                alt={item.title}
                                sx={{
                                    width: "100%",
                                    height: { xs: 300, md: 500 },
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: "24px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#fff",
                                boxShadow: "0 8px 30px rgba(15,23,42,0.05)",
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                                {item.category && (
                                    <Chip
                                        label={item.category}
                                        sx={{
                                            backgroundColor: "#eef4ff",
                                            color: "#1d4ed8",
                                            fontWeight: 700,
                                        }}
                                    />
                                )}

                                {item.condition && (
                                    <Chip
                                        icon={<VerifiedOutlinedIcon />}
                                        label={item.condition}
                                        sx={{
                                            backgroundColor: `${conditionColor}12`,
                                            color: conditionColor,
                                            fontWeight: 700,
                                            "& .MuiChip-icon": {
                                                color: conditionColor,
                                            },
                                        }}
                                    />
                                )}
                            </Box>

                            <Typography
                                sx={{
                                    fontSize: { xs: 28, md: 34 },
                                    fontWeight: 800,
                                    color: "#0f172a",
                                    lineHeight: 1.3,
                                    mb: 1.5,
                                }}
                            >
                                {item.title}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 32,
                                    fontWeight: 800,
                                    color: "#2563eb",
                                    mb: 2,
                                }}
                            >
                                {item.price} EGP
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1.5,
                                    color: "#64748b",
                                }}
                            >
                                <LocationOnIcon sx={{ fontSize: 18 }} />
                                <Typography sx={{ fontSize: "0.95rem" }}>
                                    {item.university || "University not specified"}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 3,
                                    color: "#64748b",
                                }}
                            >
                                <AccessTimeIcon sx={{ fontSize: 18 }} />
                                <Typography sx={{ fontSize: "0.95rem" }}>
                                    {formattedDate}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2.5 }} />

                            <Typography
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 800,
                                    color: "#0f172a",
                                    mb: 1.5,
                                }}
                            >
                                Description
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#475569",
                                    lineHeight: 1.8,
                                    fontSize: "0.96rem",
                                    mb: 3,
                                }}
                            >
                                {item.description || "No description available."}
                            </Typography>

                            <Divider sx={{ my: 2.5 }} />

                            <Typography
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 800,
                                    color: "#0f172a",
                                    mb: 1.5,
                                }}
                            >
                                Seller Information
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar
                                    src={sellerData?.profilePhoto || "/default-avatar.png"}
                                    sx={{ width: 52, height: 52 }}
                                />
                                <Box>
                                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                                        {sellerName}
                                    </Typography>
                                    <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>
                                        Student Seller
                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 4,
                                    py: 1.4,
                                    borderRadius: "14px",
                                    textTransform: "none",
                                    fontWeight: 800,
                                    background: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
                                }}
                            >
                                Contact Seller
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}