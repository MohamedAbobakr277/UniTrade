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
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slide,
    Snackbar,
    Alert,
    TextField
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, forwardRef } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, query, where, collection, getDocs, limit } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ItemCard from "../components/ItemCard";
import StarRatingDisplay from "../components/StarRatingDisplay";
import { createNotification } from "../services/notifications";
import { analyzeWithAI } from "../services/aiImageAnalyzer";
import SparklesIcon from "@mui/icons-material/AutoAwesome";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [sellerData, setSellerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [buyerQuantity, setBuyerQuantity] = useState(1);

    const [isFavorite, setIsFavorite] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [similarItems, setSimilarItems] = useState([]);
    const [similarLoading, setSimilarLoading] = useState(false);


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
                // Notify seller about the favorite
                if (item && item.userId && item.userId !== currentUser.uid) {
                    const likerName = currentUser.displayName || "A user";
                    createNotification(item.userId, {
                        type: "favorite",
                        message: `${likerName} favorited your item: ${item.title}`,
                        productId: item.id,
                        link: `/item/${item.id}`
                    });
                }
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

    useEffect(() => {
        // Only fetch similar items once we have the current item and its category
        if (item && item.category) {
            const fetchSimilar = async () => {
                setSimilarLoading(true);
                try {
                    // console.log("Fetching similar items for category:", item.category);
                    const q = query(
                        collection(db, "products"),
                        where("category", "==", item.category),
                        where("status", "==", "available"),
                        limit(15) // Fetch a bit more to allow AI to filter/rank
                    );
                    const snap = await getDocs(q);
                    const products = snap.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(p => p.id !== id);
                    
                    if (products.length > 0) {
                        if (products.length > 4) {
                            const titles = products.map(p => p.title);
                            const prompt = `Which of these product titles are most similar to "${item.title}"? Return ONLY the top 4 titles as a JSON array of strings. IMPORTANT: The titles must be exactly as provided. Titles: ${JSON.stringify(titles)}`;
                            try {
                                const aiResult = await analyzeWithAI(prompt);
                                if (Array.isArray(aiResult)) {
                                    // Map back from titles to product objects
                                    const ranked = aiResult
                                        .map(title => products.find(p => p.title === title))
                                        .filter(Boolean); // Remove nulls if AI hallucinated a title
                                    
                                    if (ranked.length > 0) {
                                        // Fill up to 4 if AI returned fewer
                                        const finalItems = [...ranked];
                                        products.forEach(p => {
                                            if (finalItems.length < 4 && !finalItems.find(f => f.id === p.id)) {
                                                finalItems.push(p);
                                            }
                                        });
                                        setSimilarItems(finalItems.slice(0, 4));
                                        return;
                                    }
                                }
                            } catch (aiErr) {
                                console.warn("AI recommendation failed, falling back to basic sorting:", aiErr);
                            }
                        }
                        setSimilarItems(products.slice(0, 4));
                    } else {
                        setSimilarItems([]);
                    }
                } catch (err) {
                    console.error("Error fetching similar items:", err);
                } finally {
                    setSimilarLoading(false);
                }
            };
            fetchSimilar();
        } else if (item) {
            // If item exists but has no category (fallback)
            setSimilarItems([]);
            setSimilarLoading(false);
        }
    }, [item, id]);


    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
                <Navbar />
                <Box sx={{ py: { xs: 3, md: 4 }, display: "flex", justifyContent: "center" }}>
                    <Box sx={{ width: "100%", maxWidth: "1250px", px: { xs: 2.5, md: 4 } }}>
                        <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 2, mb: 3 }} />
                        <Grid container spacing={4}>
                            <Grid item xs={12} sm={6} md={6} lg={7}>
                                <Skeleton variant="rectangular" width="100%" height={460} sx={{ borderRadius: 4 }} />
                                <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
                                    <Skeleton variant="rectangular" width={70} height={70} sx={{ borderRadius: 3 }} />
                                    <Skeleton variant="rectangular" width={70} height={70} sx={{ borderRadius: 3 }} />
                                    <Skeleton variant="rectangular" width={70} height={70} sx={{ borderRadius: 3 }} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={5}>
                                <Skeleton variant="text" width="80%" height={60} />
                                <Skeleton variant="text" width="40%" height={80} sx={{ mb: 2 }} />
                                <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                                    <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
                                    <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
                                    <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 2 }} />
                                </Box>
                                <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 2, mb: 4 }} />
                                <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 4, mb: 3 }} />
                                <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 3 }} />
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (!item) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fbff" }}>
                <Navbar />
                <Box sx={{ p: 5, display: "flex", flexDirection: "column", alignItems: "center", mt: 10 }}>
                    <Typography sx={{ fontSize: 28, fontWeight: 800, color: "text.primary" }}>
                        Item not found
                    </Typography>
                    <Typography sx={{ fontSize: 16, color: "text.secondary", mt: 1, mb: 4 }}>
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
                            fontWeight: 800,
                            background: (theme) => theme.palette.mode === 'light' 
                                ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                                : "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                            boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
                            "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 12px 25px rgba(37,99,235,0.3)",
                            }
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
        <Box sx={{ 
            minHeight: "100vh", 
            display: "flex",
            flexDirection: "column",
            background: (theme) => theme.palette.mode === 'light' 
                ? "linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%)"
                : "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" 
        }}>
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
                            color: "text.secondary",
                            bgcolor: "background.paper",
                            px: 2.5,
                            py: 0.8,
                            borderRadius: "12px",
                            boxShadow: (theme) => theme.palette.mode === 'light' ? "0 4px 14px rgba(0,0,0,0.03)" : "none",
                            border: "1px solid",
                            borderColor: "divider",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                bgcolor: "background.subtle",
                                color: "text.primary",
                                transform: "translateX(-4px)",
                                boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                            },
                        }}
                    >
                        Back to Listings
                    </Button>

                    <Grid container spacing={{ xs: 1.5, sm: 4 }} alignItems="flex-start" wrap="nowrap">
                        {/* Left Column: Image Gallery - Locked at 5/12 (~41%) */}
                        <Grid item xs={5} sm={5} md={5} lg={5} sx={{ minWidth: 0, width: "41.6%", flexBasis: "41.6%" }}>
                            <Box sx={{ position: { xs: "static", md: "sticky" }, top: "100px", minWidth: 0, width: "100%" }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        minWidth: 0,
                                        borderRadius: "20px",
                                        overflow: "hidden",
                                        position: "relative",
                                        backgroundColor: "background.paper",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        boxShadow: (theme) => theme.palette.mode === 'light' ? "0 12px 30px rgba(15,23,42,0.04)" : "none",
                                        height: { xs: "180px", sm: "300px", md: "350px", lg: "400px" },
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mb: 1.5,
                                        p: { xs: 1, sm: 3, md: 4 },
                                        width: "100%",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={imageUrl}
                                        alt={item.title}
                                        onClick={() => setIsZoomOpen(true)}
                                        sx={{
                                            width: "100%",
                                            maxWidth: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                            borderRadius: "12px",
                                            transition: "opacity 0.3s ease",
                                            cursor: "zoom-in",
                                        }}
                                    />

                                    {/* Action Chips overlay */}
                                    <Box sx={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 1 }}>
                                        {item.status === "sold" && (
                                            <Chip
                                                label="Sold Out"
                                                sx={{
                                                    bgcolor: 'error.main',
                                                    color: "white",
                                                    fontWeight: 900,
                                                    borderRadius: "12px",
                                                    px: 1,
                                                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
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
                                                    bgcolor: (theme) => theme.palette.mode === 'light' ? "rgba(255,255,255,0.85)" : "rgba(15,23,42,0.85)",
                                                    backdropFilter: "blur(6px)",
                                                    color: "text.primary",
                                                    "&:hover": { bgcolor: "background.paper", transform: "scale(1.1)" },
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
                                                    bgcolor: (theme) => theme.palette.mode === 'light' ? "rgba(255,255,255,0.85)" : "rgba(15,23,42,0.85)",
                                                    backdropFilter: "blur(6px)",
                                                    color: "text.primary",
                                                    "&:hover": { bgcolor: "background.paper", transform: "scale(1.1)" },
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
                                            backgroundColor: "background.paper",
                                            color: isFavorite ? "#ef4444" : "text.secondary",
                                            "&:hover": { backgroundColor: "background.subtle", transform: "scale(1.1)" },
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
                                                    border: '3px solid',
                                                    borderColor: currentImageIndex === idx ? 'primary.main' : 'transparent',
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

                        {/* Right Column: Details - Locked at 7/12 (~58%) */}
                        <Grid item xs={7} sm={7} md={7} lg={7} sx={{ minWidth: 0, width: "58.3%", flexBasis: "58.3%" }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
                                {/* Title and Price */}
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: 16, sm: 22, md: 32 },
                                            fontWeight: 900,
                                            color: "text.primary",
                                            lineHeight: 1.2,
                                            mb: 0.5,
                                            wordBreak: "break-word",
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: 20, sm: 26, md: 36 },
                                            fontWeight: 900,
                                            color: "primary.main",
                                            letterSpacing: "-1px",
                                            mb: 1.5,
                                        }}
                                    >
                                        {item.price} EGP
                                    </Typography>
                                </Box>

                                {/* Meta Info Chips */}
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 0.5 }}>
                                    {item.category && (
                                        <Chip
                                            icon={<CategoryIcon sx={{ fontSize: "16px !important", color: "text.secondary !important" }} />}
                                            label={item.category}
                                            sx={{ bgcolor: "background.subtle", color: "text.primary", fontWeight: 700, borderRadius: "10px", py: 2.2, px: 0.5, border: '1px solid', borderColor: 'divider' }}
                                        />
                                    )}
                                    {item.university && (
                                        <Chip
                                            icon={<LocationOnIcon sx={{ fontSize: "18px !important", color: "text.secondary !important" }} />}
                                            label={item.university}
                                            sx={{ bgcolor: "background.subtle", color: "text.primary", fontWeight: 700, borderRadius: "10px", py: 2.2, px: 0.5, border: '1px solid', borderColor: 'divider' }}
                                        />
                                    )}
                                    <Chip
                                        icon={<AccessTimeIcon sx={{ fontSize: "18px !important", color: "text.secondary !important" }} />}
                                        label={`Posted ${formattedDate}`}
                                        sx={{ bgcolor: "background.subtle", color: "text.primary", fontWeight: 700, borderRadius: "10px", py: 2.2, px: 0.5, border: '1px solid', borderColor: 'divider' }}
                                    />
                                </Box>

                                <Divider sx={{ borderColor: 'divider' }} />

                                {/* Description */}
                                <Box sx={{ maxHeight: "150px", overflowY: "auto", pr: 1, "::-webkit-scrollbar": { width: "6px" }, "::-webkit-scrollbar-thumb": { background: (theme) => theme.palette.divider, borderRadius: "10px" } }}>
                                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary", mb: 1 }}>
                                        Description
                                    </Typography>
                                    <Typography sx={{ fontSize: 14.5, color: "text.secondary", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                        {item.description || "No description provided by the seller."}
                                    </Typography>
                                </Box>

                                <Divider sx={{ borderColor: 'divider' }} />

                                {/* Stock Status & Quantity Selector */}
                                <Box>
                                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary", mb: 1.5 }}>
                                        Availability
                                    </Typography>
                                    {(() => {
                                        const stock = item.quantityAvailable ?? 1;
                                        const isOutOfStock = stock === 0;
                                        const isLowStock = stock > 0 && stock <= 3;
                                        return (
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                                                    <Chip
                                                        icon={<InventoryIcon sx={{ fontSize: "18px !important", color: 'inherit' }} />}
                                                        label={isOutOfStock ? "Out of stock" : `In stock: ${stock} item${stock !== 1 ? 's' : ''}`}
                                                        sx={{
                                                            bgcolor: isOutOfStock 
                                                                ? (theme => theme.palette.mode === 'light' ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.15)") 
                                                                : isLowStock 
                                                                    ? (theme => theme.palette.mode === 'light' ? "rgba(245, 158, 11, 0.08)" : "rgba(245, 158, 11, 0.15)") 
                                                                    : (theme => theme.palette.mode === 'light' ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.15)"),
                                                            color: isOutOfStock ? "error.main" : isLowStock ? "warning.main" : "success.main",
                                                            fontWeight: 800,
                                                            borderRadius: "12px",
                                                            py: 2.2,
                                                            px: 0.5,
                                                            border: '1px solid',
                                                            borderColor: 'inherit',
                                                            fontSize: "0.9rem",
                                                            "& .MuiChip-icon": { color: 'inherit' }
                                                        }}
                                                    />
                                                    {isLowStock && (
                                                        <Chip
                                                            icon={<WarningAmberIcon sx={{ fontSize: "16px !important", color: 'inherit' }} />}
                                                            label="Low stock"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: (theme) => theme.palette.mode === 'light' ? "rgba(245, 158, 11, 0.08)" : "rgba(245, 158, 11, 0.15)",
                                                                color: "warning.main",
                                                                fontWeight: 800,
                                                                borderRadius: "10px",
                                                                border: "1px solid",
                                                                borderColor: "warning.main",
                                                                "& .MuiChip-icon": { color: 'inherit' }
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                {!isOutOfStock && item.status !== "sold" && (
                                                    <TextField
                                                        type="number"
                                                        label="Quantity you want to buy"
                                                        value={buyerQuantity}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (isNaN(val) || val < 1) {
                                                                setBuyerQuantity(1);
                                                            } else if (val > stock) {
                                                                setBuyerQuantity(stock);
                                                            } else {
                                                                setBuyerQuantity(val);
                                                            }
                                                        }}
                                                        inputProps={{ min: 1, max: stock, step: 1 }}
                                                        size="small"
                                                        sx={{
                                                            maxWidth: 220,
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: '12px',
                                                                fontWeight: 700,
                                                                bgcolor: "background.paper",
                                                            },
                                                            '& .MuiInputLabel-root': { color: 'text.secondary' },
                                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                                                        }}
                                                        helperText={`Max: ${stock}`}
                                                    />
                                                )}
                                            </Box>
                                        );
                                    })()}
                                </Box>

                                <Divider sx={{ borderColor: "#e2e8f0" }} />

                                {/* Seller Section */}
                                <Box>
                                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary", mb: 1.5 }}>
                                        About the Seller
                                    </Typography>
                                    <Paper
                                        elevation={0}
                                        onClick={() => item.userId && navigate(`/seller/${item.userId}`)}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: "20px",
                                            bgcolor: "background.paper",
                                            border: "1px solid",
                                            borderColor: "divider",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2.5,
                                            cursor: "pointer",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: (theme) => theme.palette.mode === 'light' ? "0 4px 12px rgba(15,23,42,0.02)" : "none",
                                            "&:hover": {
                                                boxShadow: (theme) => theme.palette.mode === 'light' ? '0 12px 30px rgba(15,23,42,0.08)' : 'none',
                                                transform: 'translateY(-4px)',
                                                borderColor: 'primary.main'
                                            }
                                        }}
                                    >
                                        <Avatar
                                            src={sellerData?.profilePhoto || "/default-avatar.png"}
                                            sx={{ width: 60, height: 60, border: "2.5px solid", borderColor: "divider", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary" }}>
                                                {sellerName}
                                            </Typography>
                                            <Box sx={{ mt: 0.5, mb: 0.5 }}>
                                                <StarRatingDisplay averageRating={sellerData?.averageRating} ratingsCount={sellerData?.ratingsCount} size="small" />
                                            </Box>
                                            <Typography sx={{ fontSize: 14, color: "text.secondary", fontWeight: 600, mt: 0.3 }}>
                                                {sellerData?.major || "Verified Student"}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Box>

                                {/* CTA Button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={item.status === "sold" || item.quantityAvailable === 0}
                                    startIcon={item.status === "sold" || item.quantityAvailable === 0 ? <InventoryIcon sx={{ fontSize: 22 }} /> : <ConnectWithoutContactIcon sx={{ fontSize: 22 }} />}
                                    sx={{
                                        mt: 1.5,
                                        py: 1.8,
                                        borderRadius: "16px",
                                        textTransform: "none",
                                        fontWeight: 900,
                                        fontSize: 19,
                                        background: item.status === "sold" || item.quantityAvailable === 0 
                                            ? "text.disabled" 
                                            : (theme) => theme.palette.mode === 'light' 
                                                ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                                                : "linear-gradient(135deg, #3b82f6, #60a5fa)",
                                        boxShadow: item.status === "sold" || item.quantityAvailable === 0 
                                            ? "none" 
                                            : "0 10px 30px rgba(37,99,235,0.25)",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        "&:hover": {
                                            transform: item.status === "sold" || item.quantityAvailable === 0 ? "none" : "translateY(-4px)",
                                            boxShadow: item.status === "sold" || item.quantityAvailable === 0 
                                                ? "none" 
                                                : "0 15px 40px rgba(37,99,235,0.35)",
                                            background: item.status === "sold" || item.quantityAvailable === 0 
                                                ? "text.disabled" 
                                                : (theme) => theme.palette.mode === 'light' 
                                                    ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                                                    : "linear-gradient(135deg, #2563eb, #3b82f6)",
                                        },
                                        "&.Mui-disabled": {
                                            bgcolor: "divider",
                                            color: "text.disabled",
                                            boxShadow: "none"
                                        }
                                    }}
                                    onClick={() => setIsContactOpen(true)}
                                >
                                    {item.status === "sold" || item.quantityAvailable === 0 ? "Item Sold Out" : "Contact Seller"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

            {/* Similar Items Section */}
            {(similarLoading || similarItems.length > 0) && (
                <Box sx={{ py: 6, display: "flex", justifyContent: "center", bgcolor: "background.paper", mt: 4 }}>
                    <Box sx={{ width: "100%", maxWidth: "1250px", px: { xs: 2.5, md: 4 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
                            <Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                    <SparklesIcon sx={{ color: "primary.main", fontSize: 20 }} />
                                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "1px" }}>
                                        AI Recommended
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 900, color: "text.primary" }}>
                                    You Might Also Like
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "repeat(2, 1fr)", // Force 2 side-by-side on mobile
                                    sm: "repeat(auto-fill, minmax(250px, 1fr))",
                                    md: "repeat(4, 1fr)"
                                },
                                gap: { xs: 2, md: 3 },
                                width: "100%",
                                alignItems: "stretch"
                            }}
                        >
                            {similarLoading ? (
                                [1, 2, 3, 4].map((i) => (
                                    <Box key={i} sx={{ display: "flex" }}>
                                        <Skeleton variant="rectangular" height={350} width="100%" sx={{ borderRadius: 4 }} />
                                    </Box>
                                ))
                            ) : (
                                similarItems.map((similarItem) => (
                                    <Box key={similarItem.id} sx={{ display: "flex" }}>
                                        <ItemCard item={similarItem} />
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Box>
                </Box>
            )}
            <Footer />


            {/* Contact Seller Dialog */}
            <Dialog
                open={isContactOpen}
                onClose={() => {
                    setIsContactOpen(false);
                    setTimeout(() => setShowPhone(false), 300); // reset state on close animation
                }}
                TransitionComponent={Transition}
                keepMounted
                PaperProps={{
                    sx: {
                        borderRadius: { xs: "24px 24px 0 0", sm: "24px" },
                        m: { xs: 0, sm: 2 },
                        position: { xs: "absolute", sm: "relative" },
                        bottom: { xs: 0, sm: "auto" },
                        width: "100%",
                        p: { xs: 2.5, sm: 3.5 },
                        maxWidth: { xs: "100%", sm: "440px" },
                        boxShadow: (theme) => theme.palette.mode === 'light' ? "0 -8px 40px rgba(0,0,0,0.1)" : "none",
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundImage: "none",
                    }
                }}
            >
                {/* 1. Header */}
                <DialogTitle sx={{ fontWeight: 900, color: "text.primary", p: 0, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.3rem" }}>
                    Contact Seller
                    <IconButton onClick={() => setIsContactOpen(false)} size="small" sx={{ color: "text.secondary", bgcolor: "background.subtle", "&:hover": { bgcolor: "divider" } }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {/* 2. Seller Info Section */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                        <Avatar
                            src={sellerData?.profilePhoto || "/default-avatar.png"}
                            sx={{ width: 56, height: 56, border: "2px solid", borderColor: "divider" }}
                        />
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "text.primary" }}>
                                    {sellerName}
                                </Typography>
                                {(sellerData?.isVerified || sellerData?.major) && <VerifiedUserIcon sx={{ color: "primary.main", fontSize: "1.1rem" }} />}
                            </Box>
                            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", fontWeight: 500 }}>
                                Verified User
                            </Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ color: "text.secondary", mb: 3.5, fontSize: "0.95rem", fontWeight: 500 }}>
                        Choose how you want to contact the seller
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        {/* 3. Primary Action: WhatsApp */}
                        <Box>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<WhatsAppIcon sx={{ fontSize: "24px !important" }} />}
                                onClick={() => {
                                    const phone = sellerData?.phoneNumber || sellerData?.phone;
                                    if (phone) {
                                        let formattedPhone = phone.replace(/[^0-9]/g, '');
                                        if (formattedPhone.startsWith('01')) {
                                            formattedPhone = '2' + formattedPhone;
                                        }
                                        const message = `Hi! 👋

I'm interested in your listing on *UniTrade*:

📦 *${item.title}*
💰 Price: *EGP ${item.price}*
✅ Condition: *${item.condition || "Not specified"}*
📍 University: *${item.university || "Not specified"}*
🔢 Quantity requested: *${buyerQuantity}*

Is it still available? 😊`;

                                        // Create notification for seller
                                        if (item.userId && currentUser && item.userId !== currentUser.uid) {
                                            const buyerName = currentUser.displayName || "A user";
                                            createNotification(item.userId, {
                                                type: "interest",
                                                message: `${buyerName} is interested in your item: ${item.title}`,
                                                productId: item.id,
                                                link: `/item/${item.id}`
                                            });
                                        }

                                        window.open(
                                            `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURI(message)}`,
                                            "_blank"
                                        );
                                    } else {
                                        alert('Phone number not available for this seller.');
                                    }
                                }}
                                sx={{
                                    py: 1.8,
                                    borderRadius: "16px",
                                    textTransform: "none",
                                    fontWeight: 800,
                                    fontSize: "1.05rem",
                                    color: "#ffffff",
                                    backgroundColor: "#0aac45ff",
                                    boxShadow: "0 8px 20px rgba(37, 211, 102, 0.25)",
                                    "&:hover": {
                                        backgroundColor: "#128c4fff",
                                        boxShadow: "0 10px 24px rgba(37, 211, 102, 0.35)",
                                    },
                                }}
                            >
                                Chat on WhatsApp
                            </Button>
                            <Typography sx={{ textAlign: "center", mt: 1.2, color: "text.secondary", fontSize: "0.85rem", fontWeight: 500 }}>
                                You will continue in WhatsApp
                            </Typography>
                        </Box>

                        <Divider variant="middle" sx={{ borderColor: "divider" }} />

                        {/* 4. Phone Number Section */}
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: "16px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: 1.5,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.subtle",
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: "100%" }}>
                                <Avatar sx={{ bgcolor: "background.default", color: "text.primary", width: 44, height: 44 }}>
                                    <PhoneIcon />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}>
                                        Phone Number
                                    </Typography>

                                    {showPhone ? (
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                                            <Typography sx={{ fontSize: "1.1rem", color: "text.primary", fontWeight: 800, letterSpacing: "0.5px" }}>
                                                {(sellerData?.phoneNumber || sellerData?.phone) || "Unavailable"}
                                            </Typography>
                                            {(sellerData?.phoneNumber || sellerData?.phone) && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        const num = sellerData?.phoneNumber || sellerData?.phone;
                                                        if (num) {
                                                            navigator.clipboard.writeText(num);
                                                            setSnackbarOpen(true);
                                                        }
                                                    }}
                                                    sx={{ color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" } }}
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                                            <Typography sx={{ fontSize: "1.1rem", color: "text.primary", fontWeight: 800, letterSpacing: "2px" }}>
                                                +20 1•• ••• ••••
                                            </Typography>
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() => setShowPhone(true)}
                                                sx={{ textTransform: "none", fontWeight: 800, color: "#3b82f6" }}
                                            >
                                                Show Number
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Snackbar for Copy Confirmation */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', borderRadius: "12px", fontWeight: 600 }}>
                    Number copied to clipboard!
                </Alert>
            </Snackbar>

            {/* Full Screen Image Zoom Dialog */}
            <Dialog
                open={isZoomOpen}
                onClose={() => setIsZoomOpen(false)}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }
                }}
            >
                <IconButton
                    onClick={() => setIsZoomOpen(false)}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        zIndex: 10
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Box
                    component="img"
                    src={imageUrl}
                    alt="Zoomed product"
                    sx={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        objectFit: 'contain',
                        borderRadius: 2
                    }}
                />
            </Dialog>
        </Box>
    );
}