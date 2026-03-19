import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardMedia, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert,
    Chip, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import logo from '../assets/logo.png';
import Navbar from '../components/Navbar';
import { auth, db } from '../firebase';
import { doc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function MyListings() {
    const [userItems, setUserItems] = useState([]);
    const [isEditListingModalOpen, setIsEditListingModalOpen] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;
            const q = query(
                collection(db, "products"),
                where("userId", "==", auth.currentUser.uid)
            );
            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            items.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
            setUserItems(items);
        };
        fetchUserData();
    }, []);

    const handleOpenEditListing = (item) => {
        setCurrentEditItem(item);
        setIsEditListingModalOpen(true);
    };

    const handleSaveListing = async () => {
        try {
            const itemRef = doc(db, "products", currentEditItem.id);
            await setDoc(itemRef, currentEditItem, { merge: true });
            setUserItems(prev => prev.map(item => item.id === currentEditItem.id ? currentEditItem : item));
            setIsEditListingModalOpen(false);
            setSnackbar({ open: true, message: "Listing updated successfully", severity: "success" });
        } catch (error) {
            console.error(error);
            setSnackbar({ open: true, message: "Failed to update listing", severity: "error" });
        }
    };

    const handleOpenDeleteConfirm = (itemId) => {
        setItemToDelete(itemId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteListing = async () => {
        if (!auth.currentUser || !itemToDelete) return;
        const docRef = doc(db, "products", itemToDelete);
        try {
            await deleteDoc(docRef);
            setUserItems(prev => prev.filter(item => item.id !== itemToDelete));
            setSnackbar({ open: true, message: "Item deleted successfully!", severity: "success" });
        } catch (error) {
            console.error("Error deleting listing:", error);
            setSnackbar({ open: true, message: "Failed to delete item", severity: "error" });
        }
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleMarkAsSold = async (itemId) => {
        try {
            const itemRef = doc(db, "products", itemId);
            await updateDoc(itemRef, { status: "sold" });
            setUserItems(prev => prev.map(item => item.id === itemId ? { ...item, status: "sold" } : item));
            setSnackbar({ open: true, message: "Marked as sold", severity: "success" });
        } catch (error) {
            console.error(error);
            setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
        }
    };

    return (
        <Box sx={{ backgroundColor: '#f8fbff', minHeight: '100vh' }}>
            <Navbar />

            <Box sx={{ p: { xs: 2, md: 5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/profile')}
                        sx={{
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
                        Back to Profile
                    </Button>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', m: 0 }}>My Listings</Typography>
                </Box>

                {userItems.length > 0 ? (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: 3,
                            width: "100%",
                            alignItems: "stretch",
                        }}
                    >
                    {userItems.map((item) => (
                        <Box key={item.id} sx={{ display: 'flex' }}>
                            <Card
                                sx={{
                                    borderRadius: "24px",
                                    overflow: "hidden",
                                    border: "1px solid #e2e8f0",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                                    transition: "all 0.3s ease",
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                        boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
                                    },
                                    position: 'relative'
                                }}
                            >
                                <Box sx={{ position: "relative", overflow: "hidden" }}>
                                    <Box sx={{
                                        position: 'absolute', top: 14, left: 14, px: 1.5, py: 0.5, borderRadius: '10px',
                                        fontSize: 12, fontWeight: 700, color: 'white', zIndex: 2,
                                        bgcolor: item.status === "sold" ? '#ef4444' : '#10b981',
                                        boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
                                    }}>
                                        {item.status === "sold" ? "SOLD" : "AVAILABLE"}
                                    </Box>
                                    <CardMedia
                                        component="img"
                                        height="220"
                                        image={item.images?.[0] || item.image || "https://via.placeholder.com/400x250?text=No+Image"}
                                        sx={{
                                            width: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                            transition: "transform 0.35s ease",
                                            "&:hover": {
                                                transform: "scale(1.04)",
                                            },
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{ p: 2.2, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 800, 
                                            fontSize: "1.05rem", 
                                            color: "#0f172a", 
                                            lineHeight: 1.4, 
                                            height: "54px",
                                            display: "-webkit-box", 
                                            WebkitLineClamp: 2, 
                                            WebkitBoxOrient: "vertical", 
                                            overflow: "hidden" 
                                        }}
                                    >
                                        {item.title || "Untitled Item"}
                                    </Typography>

                                    <Typography variant="h6" sx={{ color: "#2563eb", fontWeight: 800, mt: 1.2, fontSize: "1.25rem", height: "38px" }}>
                                        {item.price ? `${item.price} EGP` : "Price not available"}
                                    </Typography>

                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.2, height: "28px" }}>
                                        <LocationOnIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                                        <Typography component="span" sx={{ fontSize: "0.92rem", color: "#64748b", fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {item.university || "University not specified"}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mt: 1.2, height: "32px" }}>
                                        <Chip
                                            icon={<VerifiedOutlinedIcon />}
                                            label={item.condition || "Condition not specified"}
                                            size="small"
                                            sx={{
                                                backgroundColor: `${item.condition === "New" ? "#16a34a" : item.condition === "Like New" ? "#2563eb" : "#f59e0b"}12`,
                                                color: item.condition === "New" ? "#16a34a" : item.condition === "Like New" ? "#2563eb" : "#f59e0b",
                                                fontWeight: 700,
                                                borderRadius: "10px",
                                                "& .MuiChip-icon": { color: item.condition === "New" ? "#16a34a" : item.condition === "Like New" ? "#2563eb" : "#f59e0b" },
                                            }}
                                        />
                                    </Box>

                                    <Typography sx={{ mt: 1.4, fontSize: "0.9rem", color: "#64748b", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", height: "48px" }}>
                                        {item.description || "No description available"}
                                    </Typography>
                                    
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: "58px", width: "100%" }}>
                                        {item.status !== "sold" && (
                                            <Button 
                                                fullWidth 
                                                variant="contained" 
                                                size="small" 
                                                sx={{ borderRadius: "10px", textTransform: 'none', bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, height: '36px', whiteSpace: 'nowrap', minWidth: 0, px: 1, fontSize: '0.85rem', fontWeight: 600, boxShadow: 'none' }} 
                                                onClick={() => handleMarkAsSold(item.id)}
                                            >
                                                Sold
                                            </Button>
                                        )}
                                        <Button 
                                            fullWidth 
                                            variant="outlined" 
                                            size="small" 
                                            startIcon={<EditIcon sx={{ fontSize: '1.1rem !important', mr: -0.5 }}/>} 
                                            sx={{ borderRadius: "10px", textTransform: 'none', height: '36px', whiteSpace: 'nowrap', minWidth: 0, px: 1, fontSize: '0.85rem', fontWeight: 600, borderColor: '#e2e8f0', color: '#334155', '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' } }} 
                                            onClick={() => handleOpenEditListing(item)}
                                        >
                                            Edit
                                        </Button>
                                        <IconButton 
                                            size="small" 
                                            sx={{ bgcolor: '#f1f5f9', borderRadius: "10px", color: '#64748b', '&:hover': { bgcolor: '#fee2e2', color: '#ef4444' }, height: '36px', width: '36px', flexShrink: 0 }} 
                                            onClick={() => handleOpenDeleteConfirm(item.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>
                ) : (
                    <Typography sx={{ color: '#64748b', fontSize: '1.1rem', mt: 2 }}>You have not posted any listings yet.</Typography>
                )}
            </Box>

            {/* Edit Listing Modal */}
            <Dialog open={isEditListingModalOpen} onClose={() => setIsEditListingModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EditIcon color="primary" /> Edit Listing
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField fullWidth label="Title" value={currentEditItem?.title || ''} onChange={(e) => setCurrentEditItem(prev => ({ ...prev, title: e.target.value }))} />
                        <TextField fullWidth label="Price" type="number" value={currentEditItem?.price || ''} onChange={(e) => setCurrentEditItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsEditListingModalOpen(false)} sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveListing} sx={{ bgcolor: '#2563eb', borderRadius: 2, px: 4, fontWeight: 700, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#1d4ed8' } }}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <DeleteIcon color="error" /> Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>Are you sure you want to delete this item? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsDeleteDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={confirmDeleteListing} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 4, boxShadow: 'none' }}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}
