import {
    Box,
    Typography,
    Paper,
    Avatar,
    Divider,
    Button,
    Grid,
    Chip,
    IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [sellerData, setSellerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [isFavorite, setIsFavorite] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        let unsubUser;
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                const userRef = doc(db, "users", user.uid);
                unsubUser = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const favs = docSnap.data().favourites || [];
                        setIsFavorite(favs.includes(id));
                    }
                });
            }
        });
        return () => {
            unsubAuth();
            if (unsubUser) unsubUser();
        };
    }, [id]);

    const toggleFavorite = async (e) => {
        e.stopPropagation();
        if (!currentUser) return;
        const userRef = doc(db, "users", currentUser.uid);
        try {
            if (isFavorite) {
                await updateDoc(userRef, { favourites: arrayRemove(id) });
            } else {
                await updateDoc(userRef, { favourites: arrayUnion(id) });
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
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
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fbff" }}>
                <Navbar />
                <Box sx={{ p: 5, display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#64748b", mt: 10 }}>
                        Loading item details...
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (!item) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fbff" }}>
                <Navbar />
                <Box sx={{ p: 5, display: "flex", flexDirection: "column", alignItems: "center", mt: 10 }}>
                    <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
                        Item not found
                    </Typography>
                    <Typography sx={{ fontSize: 16, color: "#64748b", mt: 1, mb: 4 }}>
                        The item you are looking for might have been sold or deleted.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/home")}
                        sx={{
                            borderRadius: "14px",
                            px: 4,
                            py: 1.5,
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: "#2563eb",
                            boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
                        }}
                    >
                        Back to Home
                    </Button>
                </Box>
            </Box>
        );
    }

    const hasImages = Array.isArray(item.images) && item.images.length > 0;
    const imageUrl = hasImages
        ? item.images[currentImageIndex]
        : item.image || "https://images.unsplash.com/photo-1596484552835-025d2c4b8b69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    const sellerName =
        item.sellerName || sellerData?.name || (sellerData?.firstName ? sellerData.firstName + " " + sellerData.lastName : null) || "Unknown Seller";

    const formattedDate = item.createdAt
        ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "Just now";

    return (
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%)", pb: 4 }}>
            <Navbar />

            <Box sx={{ py: { xs: 3, md: 4 }, display: "flex", justifyContent: "center" }}>
                <Box sx={{ width: "100%", maxWidth: "1250px", px: { xs: 2.5, md: 4 } }}>
                    {/* Back Button */}
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{
                            mb: 2.5,
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#64748b",
                            bgcolor: "#ffffff",
                            px: 2.5,
                            py: 0.8,
                            borderRadius: "12px",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                            border: "1px solid #e2e8f0",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                bgcolor: "#f8fafc",
                                color: "#0f172a",
                                transform: "translateX(-4px)",
                                boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                            },
                        }}
                    >
                        Back to Listings
                    </Button>

                    <Grid container spacing={4} alignItems="flex-start">
                        {/* Left Column: Image Gallery */}
                        <Grid item xs={12} sm={6} md={6} lg={7} sx={{ minWidth: 0 }}>
                            <Box sx={{ position: { xs: "static", md: "sticky" }, top: "100px", minWidth: 0 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        minWidth: 0,
                                        borderRadius: "20px",
                                        overflow: "hidden",
                                        position: "relative",
                                        backgroundColor: "#fff",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 12px 30px rgba(15,23,42,0.04)",
                                        height: { xs: "300px", sm: "350px", md: "420px", lg: "460px" },
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mb: 2,
                                        p: { xs: 2, sm: 3, md: 4 }
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={imageUrl}
                                        alt={item.title}
                                        sx={{
                                            width: "100%",
                                            maxWidth: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                            borderRadius: "12px",
                                            transition: "opacity 0.3s ease",
                                        }}
                                    />

                                    {/* Action Chips overlay */}
                                    <Box sx={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 1 }}>
                                        {item.status === "sold" && (
                                            <Chip
                                                label="Sold Out"
                                                sx={{
                                                    bgcolor: "#ef4444",
                                                    color: "white",
                                                    fontWeight: 800,
                                                    borderRadius: "12px",
                                                    px: 1,
                                                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                                                }}
                                            />
                                        )}
                                        {item.condition && (
                                            <Chip
                                                icon={<VerifiedUserIcon sx={{ color: "#fff !important" }} />}
                                                label={item.condition}
                                                sx={{
                                                    bgcolor: "rgba(15, 23, 42, 0.65)",
                                                    backdropFilter: "blur(8px)",
                                                    color: "white",
                                                    fontWeight: 600,
                                                    borderRadius: "12px",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                }}
                                            />
                                        )}
                                    </Box>

                                    {hasImages && item.images.length > 1 && (
                                        <>
                                            <IconButton
                                                onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1))}
                                                sx={{
                                                    position: "absolute",
                                                    left: 16,
                                                    bgcolor: "rgba(255,255,255,0.85)",
                                                    backdropFilter: "blur(6px)",
                                                    color: "#0f172a",
                                                    "&:hover": { bgcolor: "#fff", transform: "scale(1.1)" },
                                                    transition: "all 0.2s",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                }}
                                            >
                                                <ArrowBackIosNewIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => setCurrentImageIndex((prev) => (prev === item.images.length - 1 ? 0 : prev + 1))}
                                                sx={{
                                                    position: "absolute",
                                                    right: 16,
                                                    bgcolor: "rgba(255,255,255,0.85)",
                                                    backdropFilter: "blur(6px)",
                                                    color: "#0f172a",
                                                    "&:hover": { bgcolor: "#fff", transform: "scale(1.1)" },
                                                    transition: "all 0.2s",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                }}
                                            >
                                                <ArrowForwardIosIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    )}

                                    <IconButton
                                        onClick={toggleFavorite}
                                        sx={{
                                            position: "absolute",
                                            bottom: 18,
                                            right: 18,
                                            backgroundColor: "#ffffff",
                                            color: isFavorite ? "#ef4444" : "#94a3b8",
                                            "&:hover": { backgroundColor: "#f8fafc", transform: "scale(1.1)" },
                                            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                                            transition: "all 0.2s ease",
                                            width: 48,
                                            height: 48,
                                        }}
                                    >
                                        {isFavorite ? <FavoriteIcon sx={{ fontSize: 26 }} /> : <FavoriteBorderIcon sx={{ fontSize: 26 }} />}
                                    </IconButton>
                                </Paper>

                                {/* Thumbnails */}
                                {hasImages && item.images.length > 1 && (
                                    <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 1, "::-webkit-scrollbar": { height: "6px" }, "::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "10px" } }}>
                                        {item.images.map((img, idx) => (
                                            <Box
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                sx={{
                                                    width: 70,
                                                    height: 70,
                                                    borderRadius: "12px",
                                                    overflow: "hidden",
                                                    cursor: "pointer",
                                                    border: currentImageIndex === idx ? "3px solid #3b82f6" : "2px solid transparent",
                                                    opacity: currentImageIndex === idx ? 1 : 0.6,
                                                    transition: "all 0.2s ease",
                                                    flexShrink: 0,
                                                    "&:hover": { opacity: 1, transform: "translateY(-4px)" },
                                                }}
                                            >
                                                <img src={img} alt="thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Grid>

                        {/* Right Column: Details */}
                        <Grid item xs={12} sm={6} md={6} lg={5} sx={{ minWidth: 0 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
                                {/* Title and Price */}
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: 26, md: 32 },
                                            fontWeight: 800,
                                            color: "#0f172a",
                                            lineHeight: 1.25,
                                            mb: 1,
                                            wordBreak: "break-word",
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {item.title}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: { xs: 30, md: 36 },
                                            fontWeight: 800,
                                            background: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            letterSpacing: "-1px",
                                            mb: 2,
                                        }}
                                    >
                                        {item.price} EGP
                                    </Typography>
                                </Box>

                                {/* Meta Info Chips */}
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 0.5 }}>
                                    {item.category && (
                                        <Chip
                                            icon={<CategoryIcon sx={{ fontSize: "16px !important", color: "#64748b !important" }} />}
                                            label={item.category}
                                            sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 600, borderRadius: "10px", py: 2, px: 0.5, border: '1px solid #e2e8f0' }}
                                        />
                                    )}
                                    {item.university && (
                                        <Chip
                                            icon={<LocationOnIcon sx={{ fontSize: "18px !important", color: "#64748b !important" }} />}
                                            label={item.university}
                                            sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 600, borderRadius: "10px", py: 2, px: 0.5, border: '1px solid #e2e8f0' }}
                                        />
                                    )}
                                    <Chip
                                        icon={<AccessTimeIcon sx={{ fontSize: "18px !important", color: "#64748b !important" }} />}
                                        label={`Posted ${formattedDate}`}
                                        sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 600, borderRadius: "10px", py: 2, px: 0.5, border: '1px solid #e2e8f0' }}
                                    />
                                </Box>

                                <Divider sx={{ borderColor: "#e2e8f0" }} />

                                {/* Description */}
                                <Box sx={{ maxHeight: "150px", overflowY: "auto", pr: 1, "::-webkit-scrollbar": { width: "6px" }, "::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "10px" } }}>
                                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0f172a", mb: 1 }}>
                                        Description
                                    </Typography>
                                    <Typography sx={{ fontSize: 14.5, color: "#475569", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                        {item.description || "No description provided by the seller."}
                                    </Typography>
                                </Box>

                                <Divider sx={{ borderColor: "#e2e8f0" }} />

                                {/* Seller Section */}
                                <Box>
                                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0f172a", mb: 1.5 }}>
                                        About the Seller
                                    </Typography>
                                    <Paper
                                        elevation={0}
                                        onClick={() => item.userId && navigate(`/seller/${item.userId}`)}
                                        sx={{
                                            p: 2,
                                            borderRadius: "16px",
                                            bgcolor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            "&:hover": { boxShadow: '0 6px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)', borderColor: '#cbd5e1' }
                                        }}
                                    >
                                        <Avatar
                                            src={sellerData?.profilePhoto || "/default-avatar.png"}
                                            sx={{ width: 54, height: 54, border: "2px solid #e2e8f0" }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                                                {sellerName}
                                            </Typography>
                                            <Typography sx={{ fontSize: 13, color: "#64748b", fontWeight: 500, mt: 0.2 }}>
                                                {sellerData?.major || "Verified Student"}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Box>

                                {/* CTA Button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<ConnectWithoutContactIcon />}
                                    sx={{
                                        mt: 1,
                                        py: 1.5,
                                        borderRadius: "14px",
                                        textTransform: "none",
                                        fontWeight: 800,
                                        fontSize: 18,
                                        background: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
                                        boxShadow: "0 10px 24px rgba(37,99,235,0.25)",
                                        "&:hover": {
                                            transform: "translateY(-3px)",
                                            boxShadow: "0 14px 30px rgba(37,99,235,0.32)",
                                            background: "linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)",
                                        },
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    Contact Seller
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}