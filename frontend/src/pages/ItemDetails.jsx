import {
    Box,
    Typography,
    Paper,
    Avatar,
    Divider,
    Button,
    Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                console.error(error);
                setItem(null);
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh" }}>
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
            <Box sx={{ minHeight: "100vh" }}>
                <Navbar />
                <Box sx={{ p: 5 }}>
                    <Typography sx={{ fontSize: 26, fontWeight: 800 }}>
                        Item not found
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/home")}
                        sx={{ mt: 2, textTransform: "none", fontWeight: 700 }}
                    >
                        Back to Home
                    </Button>
                </Box>
            </Box>
        );
    }

    const hasImages =
        Array.isArray(item.images) && item.images.length > 0;

    const imageUrl = hasImages
        ? item.images[currentImageIndex]
        : item.image ||
        "https://via.placeholder.com/700x450?text=No+Image";

    const sellerName =
        item.sellerName ||
        sellerData?.name ||
        sellerData?.fullName ||
        "Unknown Seller";

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background:
                    "linear-gradient(180deg, #f8fbff 0%, #f5f7fb 100%)",
            }}
        >
            <Navbar />

            {/* 🔥 Center Layout */}
            <Box
                sx={{
                    py: 4,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "1200px",
                        px: { xs: 2, md: 3 },
                    }}
                >
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{
                            mb: 3,
                            textTransform: "none",
                            fontWeight: 700,
                        }}
                    >
                        Back
                    </Button>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={7}>
                            <Paper
                                sx={{
                                    borderRadius: "20px",
                                    overflow: "hidden",
                                    position: "relative",
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
                                    }}
                                />

                                {hasImages && item.images.length > 1 && (
                                    <>
                                        <Button
                                            onClick={() =>
                                                setCurrentImageIndex(
                                                    (prev) =>
                                                        prev === 0
                                                            ? item.images.length - 1
                                                            : prev - 1
                                                )
                                            }
                                            sx={{
                                                position: "absolute",
                                                top: "50%",
                                                left: 10,
                                                transform:
                                                    "translateY(-50%)",
                                                backgroundColor:
                                                    "rgba(0,0,0,0.5)",
                                                color: "#fff",
                                                minWidth: 40,
                                            }}
                                        >
                                            ◀
                                        </Button>

                                        <Button
                                            onClick={() =>
                                                setCurrentImageIndex(
                                                    (prev) =>
                                                        prev ===
                                                            item.images.length - 1
                                                            ? 0
                                                            : prev + 1
                                                )
                                            }
                                            sx={{
                                                position: "absolute",
                                                top: "50%",
                                                right: 10,
                                                transform:
                                                    "translateY(-50%)",
                                                backgroundColor:
                                                    "rgba(0,0,0,0.5)",
                                                color: "#fff",
                                                minWidth: 40,
                                            }}
                                        >
                                            ▶
                                        </Button>
                                    </>
                                )}
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: "20px",
                                    backgroundColor: "#fff",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 26,
                                        fontWeight: 800,
                                        mb: 2,
                                    }}
                                >
                                    {item.title}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 30,
                                        fontWeight: 800,
                                        color: "#2563eb",
                                        mb: 2,
                                    }}
                                >
                                    {item.price} EGP
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Typography
                                    sx={{ fontWeight: 800, mb: 1 }}
                                >
                                    Description
                                </Typography>

                                <Typography sx={{ mb: 3 }}>
                                    {item.description ||
                                        "No description available."}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Typography
                                    sx={{ fontWeight: 800, mb: 1 }}
                                >
                                    Seller
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                    }}
                                >
                                    <Avatar
                                        src={
                                            sellerData?.profilePhoto ||
                                            "/default-avatar.png"
                                        }
                                        sx={{ width: 50, height: 50 }}
                                    />
                                    <Box>
                                        <Typography
                                            sx={{ fontWeight: 700 }}
                                        >
                                            {sellerName}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "0.9rem",
                                                color: "#64748b",
                                            }}
                                        >
                                            Student Seller
                                        </Typography>
                                    </Box>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        mt: 4,
                                        py: 1.3,
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontWeight: 800,
                                    }}
                                >
                                    Contact Seller
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}