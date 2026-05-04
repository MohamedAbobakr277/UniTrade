import {
    Box,
    Typography,
    Avatar,
    Button,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Divider,
    Snackbar,
    Alert,
    Slide,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import { useEffect, useState, forwardRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import Navbar from "../components/Navbar";
import ItemCard from "../components/ItemCard";
import Footer from "../components/Footer";
import EmptyState from "../components/EmptyState";
import StarRatingDisplay from "../components/StarRatingDisplay";
import StarRatingInput from "../components/StarRatingInput";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function SellerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [seller, setSeller] = useState(null);
    const [sellerItems, setSellerItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchSellerData = async () => {
            try {
                // Fetch seller profile
                const userRef = doc(db, "users", id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setSeller(userSnap.data());
                } else {
                    setSeller(null);
                    setLoading(false);
                    return;
                }

                // Fetch seller items
                const q = query(collection(db, "products"), where("userId", "==", id));
                const querySnapshot = await getDocs(q);
                const itemsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Sort by recent
                itemsList.sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });
                
                setSellerItems(itemsList);
            } catch (error) {
                console.error("Error fetching seller data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSellerData();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fbff" }}>
                <Navbar />
                <Box sx={{ p: { xs: 2.5, md: 5 }, maxWidth: "1250px", mx: "auto" }}>
                    <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2, mb: 3 }} />
                    <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 4, mb: 5 }} />
                    <Skeleton variant="text" width={250} height={40} sx={{ mb: 3 }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
                        <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4 }} />
                        <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4 }} />
                        <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4 }} />
                    </Box>
                </Box>
            </Box>
        );
    }

    if (!seller) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fbff" }}>
                <Navbar />
                <Box sx={{ p: 5, display: "flex", flexDirection: "column", alignItems: "center", mt: 10 }}>
                    <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
                        Seller not found
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{ mt: 3, borderRadius: "14px", px: 4, py: 1.5, textTransform: "none", fontWeight: 700, bgcolor: "#2563eb" }}
                    >
                        Go Back
                    </Button>
                </Box>
            </Box>
        );
    }

    const sellerName = seller.name || (seller.firstName ? seller.firstName + " " + seller.lastName : "Unknown Seller");
    const availableItems = sellerItems.filter(item => item.status !== "sold").length;
    const soldItems = sellerItems.filter(item => item.status === "sold").length;

    return (
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%)", pb: 10 }}>
            <Navbar />

            <Box sx={{ py: { xs: 3, md: 5 }, display: "flex", justifyContent: "center" }}>
                <Box sx={{ width: "100%", maxWidth: "1250px", px: { xs: 2.5, md: 4 } }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{
                            mb: 3,
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
                        Back
                    </Button>

                    {/* Seller Header */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            p: 4,
                            bgcolor: "#fff",
                            borderRadius: "24px",
                            boxShadow: "0 12px 30px rgba(15,23,42,0.03)",
                            border: "1px solid #e2e8f0",
                            mb: 5,
                            flexDirection: { xs: "column", sm: "row" },
                            textAlign: { xs: "center", sm: "left" }
                        }}
                    >
                        <Avatar
                            src={seller.profilePhoto || "/default-avatar.png"}
                            sx={{ width: 100, height: 100, border: "4px solid #f8fbff", boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", sm: "flex-start" }, gap: 1, mb: 0.5 }}>
                                <Typography sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800, color: "#0f172a" }}>
                                    {sellerName}
                                </Typography>
                                <VerifiedUserIcon sx={{ color: "#3b82f6", fontSize: 24 }} />
                            </Box>
                            
                            <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-start" }, mb: 1.5 }}>
                                <StarRatingDisplay averageRating={seller.averageRating} ratingsCount={seller.ratingsCount} size="medium" />
                            </Box>
                            
                            <Typography sx={{ fontSize: 16, color: "#64748b", fontWeight: 500, mb: 2 }}>
                                {seller.major || "Student"} • {seller.university || "University not provided"}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", sm: "flex-start" }, gap: 4 }}>
                                <Box>
                                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>{availableItems}</Typography>
                                    <Typography sx={{ fontSize: 13, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", mt: 0.5 }}>Available</Typography>
                                </Box>
                                <Box sx={{ width: "2px", height: "30px", bgcolor: "#f1f5f9" }} />
                                <Box>
                                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#ef4444", lineHeight: 1 }}>{soldItems}</Typography>
                                    <Typography sx={{ fontSize: 13, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", mt: 0.5 }}>Sold</Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Button
                            variant="contained"
                            startIcon={<ConnectWithoutContactIcon />}
                            onClick={() => setIsContactOpen(true)}
                            sx={{
                                mt: { xs: 2, sm: 0 },
                                borderRadius: "14px",
                                px: 4,
                                py: 1.5,
                                textTransform: "none",
                                fontWeight: 800,
                                fontSize: 16,
                                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-3px)",
                                    boxShadow: "0 14px 30px rgba(37,99,235,0.35)",
                                    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                                },
                            }}
                        >
                            Contact Seller
                        </Button>
                    </Box>

                    {/* Rate Seller Section */}
                    {currentUser && currentUser.uid !== id && (
                        <Box sx={{ mb: 5 }}>
                            <StarRatingInput sellerId={id} currentUser={currentUser} />
                        </Box>
                    )}

                    {/* Listings Grid */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                        <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
                            Seller Listings
                        </Typography>
                        <Box sx={{ px: 1.5, py: 0.5, bgcolor: "#e0e7ff", color: "#4f46e5", fontWeight: 800, borderRadius: "10px", fontSize: 14 }}>
                            {sellerItems.length} items
                        </Box>
                    </Box>

                    {sellerItems.length > 0 ? (
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                gap: 3,
                            }}
                        >
                            {sellerItems.map((item) => (
                                <ItemCard key={item.id} item={item} />
                            ))}
                        </Box>
                    ) : (
                        <EmptyState 
                          title="No Active Listings"
                          description="This seller doesn't have any active items for sale right now. Check back later!"
                          iconType="inventory"
                        />
                    )}
                </Box>
            </Box>
            <Footer />

            {/* ===== Contact Seller Dialog ===== */}
            <Dialog
                open={isContactOpen}
                onClose={() => {
                    setIsContactOpen(false);
                    setTimeout(() => setShowPhone(false), 300);
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
                {/* Header */}
                <DialogTitle sx={{ fontWeight: 900, color: "#0f172a", p: 0, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.3rem" }}>
                    Contact Seller
                    <IconButton
                        onClick={() => { setIsContactOpen(false); setTimeout(() => setShowPhone(false), 300); }}
                        size="small"
                        sx={{ color: "#64748b", bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {/* Seller Info */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                        <Avatar
                            src={seller?.profilePhoto || "/default-avatar.png"}
                            sx={{ width: 56, height: 56, border: "2px solid #f1f5f9" }}
                        />
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                                    {sellerName}
                                </Typography>
                                <VerifiedUserIcon sx={{ color: "#3b82f6", fontSize: "1.1rem" }} />
                            </Box>
                            <Typography sx={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>
                                {seller?.major || "Verified Student"}
                            </Typography>
                        </Box>
                    </Box>

                    <Typography sx={{ color: "#475569", mb: 3.5, fontSize: "0.95rem", fontWeight: 500 }}>
                        Choose how you want to contact the seller
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        {/* WhatsApp Button */}
                        <Box>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<WhatsAppIcon sx={{ fontSize: "24px !important" }} />}
                                onClick={() => {
                                    const phone = seller?.phoneNumber || seller?.phone;
                                    if (phone) {
                                        let formatted = phone.replace(/[^0-9]/g, "");
                                        if (formatted.startsWith("01")) formatted = "2" + formatted;
                                        const message = `Hi ${sellerName}! 👋\n\nI found your profile on *UniTrade* and would like to connect. Are any of your listings still available? 😊`;
                                        window.open(
                                            `https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURI(message)}`,
                                            "_blank"
                                        );
                                    } else {
                                        setIsContactOpen(false);
                                    }
                                }}
                                sx={{
                                    py: 1.8,
                                    borderRadius: "16px",
                                    textTransform: "none",
                                    fontWeight: 800,
                                    fontSize: "1.05rem",
                                    color: "#ffffff",
                                    backgroundColor: "#0aac45",
                                    boxShadow: "0 8px 20px rgba(37,211,102,0.25)",
                                    "&:hover": {
                                        backgroundColor: "#128c4f",
                                        boxShadow: "0 10px 24px rgba(37,211,102,0.35)",
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

                        {/* Phone Number Section */}
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
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                                <Avatar sx={{ bgcolor: "rgba(15,23,42,0.06)", color: "#475569", width: 44, height: 44 }}>
                                    <PhoneIcon />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.2 }}>
                                        Phone Number
                                    </Typography>
                                    {showPhone ? (
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                                            <Typography sx={{ fontSize: "1.1rem", color: "#0f172a", fontWeight: 800, letterSpacing: "0.5px" }}>
                                                {(seller?.phoneNumber || seller?.phone) || "Unavailable"}
                                            </Typography>
                                            {(seller?.phoneNumber || seller?.phone) && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        const num = seller?.phoneNumber || seller?.phone;
                                                        if (num) {
                                                            navigator.clipboard.writeText(num);
                                                            setSnackbarOpen(true);
                                                        }
                                                    }}
                                                    sx={{ color: "#3b82f6", bgcolor: "rgba(59,130,246,0.1)", "&:hover": { bgcolor: "rgba(59,130,246,0.2)" } }}
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

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}>
                    Number copied to clipboard!
                </Alert>
            </Snackbar>
        </Box>
    );
}
