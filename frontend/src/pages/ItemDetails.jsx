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
    Alert
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
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import { useEffect, useState, forwardRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
                                        backgroundColor: "#fff",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 12px 30px rgba(15,23,42,0.04)",
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

                        {/* Right Column: Details - Locked at 7/12 (~58%) */}
                        <Grid item xs={7} sm={7} md={7} lg={7} sx={{ minWidth: 0, width: "58.3%", flexBasis: "58.3%" }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
                                {/* Title and Price */}
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: 16, sm: 22, md: 32 },
                                            fontWeight: 900,
                                            color: "#0f172a",
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
                                            color: "#2563eb",
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
                                            icon={<CategoryIcon sx={{ fontSize: "16px !important", color: "#64748b !important" }} />}
                                            label={item.category}
                                            sx={{ bgcolor: "#f8fafc", color: "#475569", fontWeight: 700, borderRadius: "10px", py: 2.2, px: 0.5, border: '1px solid #e2e8f0' }}
                                        />
                                    )}
                                    {item.university && (
                                        <Chip
                                            icon={<LocationOnIcon sx={{ fontSize: "18px !important", color: "#64748b !important" }} />}
                                            label={item.university}
                                            sx={{ bgcolor: "#f8fafc", color: "#475569", fontWeight: 700, borderRadius: "10px", py: 2.2, px: 0.5, border: '1px solid #e2e8f0' }}
                                        />
                                    )}
                                    <Chip
                                        icon={<AccessTimeIcon sx={{ fontSize: "18px !important", color: "#64748b !important" }} />}
                                        label={`Posted ${formattedDate}`}
                                        sx={{ bgcolor: "#f8fafc", color: "#475569", fontWeight: 700, borderRadius: "10px", py: 2.2, px: 0.5, border: '1px solid #e2e8f0' }}
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
                                            p: 2.5,
                                            borderRadius: "20px",
                                            bgcolor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2.5,
                                            cursor: "pointer",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: "0 4px 12px rgba(15,23,42,0.02)",
                                            "&:hover": {
                                                boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
                                                transform: 'translateY(-4px)',
                                                borderColor: '#3b82f6'
                                            }
                                        }}
                                    >
                                        <Avatar
                                            src={sellerData?.profilePhoto || "/default-avatar.png"}
                                            sx={{ width: 60, height: 60, border: "2,5px solid #f1f5f9", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
                                                {sellerName}
                                            </Typography>
                                            <Typography sx={{ fontSize: 14, color: "#64748b", fontWeight: 600, mt: 0.3 }}>
                                                {sellerData?.major || "Verified Student"}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Box>

                                {/* CTA Button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<ConnectWithoutContactIcon sx={{ fontSize: 22 }} />}
                                    sx={{
                                        mt: 1.5,
                                        py: 1.8,
                                        borderRadius: "16px",
                                        textTransform: "none",
                                        fontWeight: 900,
                                        fontSize: 19,
                                        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                        boxShadow: "0 10px 30px rgba(37,99,235,0.25)",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 15px 40px rgba(37,99,235,0.35)",
                                            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                        },
                                    }}
                                    onClick={() => setIsContactOpen(true)}
                                >
                                    Contact Seller
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

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
                        boxShadow: "0 -8px 40px rgba(0,0,0,0.1)",
                        border: "1px solid rgba(255,255,255,0.8)",
                    }
                }}
            >
                {/* 1. Header */}
                <DialogTitle sx={{ fontWeight: 900, color: "#0f172a", p: 0, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.3rem" }}>
                    Contact Seller
                    <IconButton onClick={() => setIsContactOpen(false)} size="small" sx={{ color: "#64748b", bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {/* 2. Seller Info Section */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                        <Avatar
                            src={sellerData?.profilePhoto || "/default-avatar.png"}
                            sx={{ width: 56, height: 56, border: "2px solid #f1f5f9" }}
                        />
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                                    {sellerName}
                                </Typography>
                                {(sellerData?.isVerified || sellerData?.major) && <VerifiedUserIcon sx={{ color: "#3b82f6", fontSize: "1.1rem" }} />}
                            </Box>
                            <Typography sx={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>
                                Verified User
                            </Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ color: "#475569", mb: 3.5, fontSize: "0.95rem", fontWeight: 500 }}>
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

Is it still available? 😊`;

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
                            <Typography sx={{ textAlign: "center", mt: 1.2, color: "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}>
                                You will continue in WhatsApp
                            </Typography>
                        </Box>

                        <Divider variant="middle" sx={{ borderColor: "#e2e8f0" }} />

                        {/* 4. Phone Number Section */}
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: "16px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: 1.5,
                                border: "1px solid #e2e8f0",
                                bgcolor: "#f8fafc",
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: "100%" }}>
                                <Avatar sx={{ bgcolor: "rgba(15, 23, 42, 0.06)", color: "#475569", width: 44, height: 44 }}>
                                    <PhoneIcon />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}>
                                        Phone Number
                                    </Typography>

                                    {showPhone ? (
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                                            <Typography sx={{ fontSize: "1.1rem", color: "#0f172a", fontWeight: 800, letterSpacing: "0.5px" }}>
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
                                            <Typography sx={{ fontSize: "1.1rem", color: "#0f172a", fontWeight: 800, letterSpacing: "2px" }}>
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