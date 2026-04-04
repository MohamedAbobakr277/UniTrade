import { Box, Typography, Avatar, Button, Skeleton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";
import ItemCard from "../components/ItemCard";
import Footer from "../components/Footer";
import EmptyState from "../components/EmptyState";

export default function SellerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [seller, setSeller] = useState(null);
    const [sellerItems, setSellerItems] = useState([]);
    const [loading, setLoading] = useState(true);

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
                            
                            <Typography sx={{ fontSize: 16, color: "#64748b", fontWeight: 500, mb: 2 }}>
                                {seller.major || "Student"} • {seller.university || "University not provided"}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", sm: "flex-start" }, gap: 4 }}>
                                <Box>
                                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>{sellerItems.length}</Typography>
                                    <Typography sx={{ fontSize: 13, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", mt: 0.5 }}>Listings</Typography>
                                </Box>
                                <Box sx={{ width: "2px", height: "30px", bgcolor: "#f1f5f9" }} />
                                <Box>
                                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#10b981", lineHeight: 1 }}>100%</Typography>
                                    <Typography sx={{ fontSize: 13, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", mt: 0.5 }}>Verified</Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Button
                            variant="contained"
                            sx={{
                                mt: { xs: 2, sm: 0 },
                                borderRadius: "14px",
                                px: 4,
                                py: 1.5,
                                textTransform: "none",
                                fontWeight: 800,
                                fontSize: 16,
                                bgcolor: "#2563eb",
                                boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
                                "&:hover": { bgcolor: "#1d4ed8" }
                            }}
                        >
                            Contact Seller
                        </Button>
                    </Box>

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
        </Box>
    );
}
