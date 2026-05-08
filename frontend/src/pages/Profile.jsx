import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Avatar,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Snackbar,
    Alert,
    InputAdornment,
    Chip,
    FormControl,
    InputLabel,
    Select,
    Skeleton,
} from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import logo from '../assets/logo.png';
import StarRatingDisplay from '../components/StarRatingDisplay';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { notifyPriceDrop, notifyItemSold } from '../services/notifications';
import { useNavigate } from 'react-router-dom';

const universities = [
    "Cairo University", "Ain Shams University", "Alexandria University",
    "Mansoura University", "Assiut University", "Helwan University",
    "Tanta University", "Zagazig University", "Suez Canal University",
    "Al-Azhar University", "German University in Cairo", "British University in Egypt",
    "October 6 University", "Future University in Egypt", "AASTMT", "Nile University", "Others"
];
const faculties = [
    "Computer Science", "Engineering", "Medicine", "Pharmacy", "Law",
    "Business Administration", "Dentistry", "Arts", "Science", "Nursing",
    "Education", "Agriculture", "Economics", "Philosophy", "Mass Communication", "Others"
];

export default function Profile() {
    const [userItems, setUserItems] = useState([]);
    const [user, setUser] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [customUniversity, setCustomUniversity] = useState("");
    const [customFaculty, setCustomFaculty] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleOpenEditModal = () => {
        const data = { ...user };
        let cUni = "";
        let cFac = "";

        if (data.university && !universities.includes(data.university) && data.university !== "Others") {
            cUni = data.university;
            data.university = "Others";
        }
        if (data.faculty && !faculties.includes(data.faculty) && data.faculty !== "Others") {
            cFac = data.faculty;
            data.faculty = "Others";
        }

        setCustomUniversity(cUni);
        setCustomFaculty(cFac);
        setEditData(data);
        setIsEditModalOpen(true);
    };
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isEditListingModalOpen, setIsEditListingModalOpen] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const navigate = useNavigate();
    const handleOpenEditListing = (item) => {
        setCurrentEditItem(item);
        setIsEditListingModalOpen(true);
    };
    useEffect(() => {

        const fetchUserData = async () => {

            if (!auth.currentUser) return;

            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                setUser(userSnap.data());
            }

            /* تحميل منتجات المستخدم */

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
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setEditData(prev => ({ ...prev, profilePhoto: event.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const finalData = { ...editData };
            if (finalData.university === "Others") {
                finalData.university = customUniversity;
            }
            if (finalData.faculty === "Others") {
                finalData.faculty = customFaculty;
            }

            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, finalData, { merge: true }); // merge: true للحفاظ على البيانات الأخرى
            setUser(finalData);
            setIsEditModalOpen(false);
            setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        } catch (error) {
            console.error("Error updating profile:", error);
            setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
        }
    };
    const handleResetPassword = async () => {
        if (passwords.new !== passwords.confirm) {
            setSnackbar({ open: true, message: 'Passwords do not match!', severity: 'error' });
            return;
        }

        try {
            await updatePassword(auth.currentUser, passwords.new);
            setIsResetModalOpen(false);
            setPasswords({ new: '', confirm: '' });
            setSnackbar({ open: true, message: 'Password updated successfully!', severity: 'success' });
        } catch (error) {
            console.error(error);
            setSnackbar({ open: true, message: 'Failed to update password', severity: 'error' });
        }
    };
    const handleSaveListing = async () => {
        const qty = parseInt(currentEditItem?.quantityAvailable);
        if (isNaN(qty) || qty < 0) {
            setSnackbar({ open: true, message: "Available Quantity must be a number ≥ 0", severity: "error" });
            return;
        }
        try {
            // Auto-update status based on quantity
            const newStatus = qty === 0 ? "sold" : "available";
            const updatedItem = { ...currentEditItem, quantityAvailable: qty, status: newStatus };

            const itemRef = doc(db, "products", currentEditItem.id);

            // Check for price drop to notify favorited users
            const originalItem = userItems.find(i => i.id === currentEditItem.id);
            const oldPrice = originalItem?.price || 0;
            const newPrice = updatedItem.price || 0;

            await setDoc(itemRef, updatedItem, { merge: true });

            if (newPrice < oldPrice) {
                notifyPriceDrop(currentEditItem.id, updatedItem.title, oldPrice, newPrice);
            }
            if (qty === 0) {
                notifyItemSold(currentEditItem.id, updatedItem.title);
            }

            setUserItems(prev =>
                prev.map(item =>
                    item.id === currentEditItem.id ? updatedItem : item
                )
            );


            setIsEditListingModalOpen(false);

            let msg = "Listing updated successfully";
            if (newPrice < oldPrice) msg = "Listing updated & Price drop notification sent! 💸";
            if (qty === 0) msg = "Item marked as SOLD (0 quantity)";

            setSnackbar({
                open: true,
                message: msg,
                severity: "success",
            });

        } catch (error) {

            console.error(error);

            setSnackbar({
                open: true,
                message: "Failed to update listing",
                severity: "error",
            });

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

            setSnackbar({
                open: true,
                message: "Item deleted successfully!",
                severity: "success",
            });
        } catch (error) {
            console.error("Error deleting listing:", error);
            setSnackbar({
                open: true,
                message: "Failed to delete item",
                severity: "error",
            });
        }
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
    };
    // 🔥 أضف الفنكشن دي فوق return (بعد handleDeleteListing)

    const handleMarkAsSold = async (itemId) => {

        try {

            const itemRef = doc(db, "products", itemId);

            await updateDoc(itemRef, {
                status: "sold",
                quantityAvailable: 0
            });

            const item = userItems.find(i => i.id === itemId);
            if (item) {
                notifyItemSold(itemId, item.title);
            }

            setUserItems(prev =>
                prev.map(item =>
                    item.id === itemId ? { ...item, status: "sold", quantityAvailable: 0 } : item
                )
            );

            setSnackbar({
                open: true,
                message: "Marked as sold",
                severity: "success",
            });

        } catch (error) {

            console.error(error);

            setSnackbar({
                open: true,
                message: "Failed to update status",
                severity: "error",
            });

        }
    };
    if (!user) {
        return (
            <Box sx={{ backgroundColor: "background.default", minHeight: '100vh' }}>
                <Navbar />
                <Box sx={{ display: 'flex' }}>
                    <Box sx={{ width: 280, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', minHeight: 'calc(100vh - 93px)', p: 3 }}>
                        <Skeleton variant="text" width="80%" height={40} sx={{ mb: 3 }} />
                        <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 1, borderRadius: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2 }} />
                    </Box>
                    <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 4 }} />
                        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                            <Skeleton variant="rectangular" width={350} height={400} sx={{ borderRadius: 4, flexShrink: 0 }} />
                            <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 4, height: 400 }} />
                        </Box>
                    </Box>
                </Box>
                <Footer />
            </Box>
        );
    }
    return (
        <Box sx={{ 
            backgroundColor: "background.default", 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Navbar />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ 
                    width: { xs: '100%', md: 280 }, 
                    borderRight: { xs: 'none', md: '1px solid' },
                    borderBottom: { xs: '1px solid', md: 'none' },
                    borderColor: 'divider', 
                    bgcolor: 'background.paper', 
                    minHeight: { xs: 'auto', md: 'calc(100vh - 93px)' } 
                }}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>{user.firstName} {user.lastName}</Typography>
                        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    selected
                                    sx={{
                                        borderRadius: 2,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'primary.dark' }
                                        }
                                    }}
                                >
                                    <ListItemIcon><PersonIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                                    <ListItemText primary="My Profile" primaryTypographyProps={{ fontWeight: 700 }} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton sx={{ borderRadius: 2 }} onClick={() => navigate('/favourites')}>
                                    <ListItemIcon><FavoriteIcon /></ListItemIcon>
                                    <ListItemText primary="Favourites" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                        <Divider sx={{ my: 3 }} />
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        borderRadius: 2,
                                        color: 'error.main',
                                        '&:hover': { bgcolor: (theme) => theme.palette.mode === 'light' ? '#fff1f2' : 'rgba(239, 68, 68, 0.1)' }
                                    }}
                                    onClick={async () => {
                                        try {
                                            await auth.signOut();
                                            navigate('/login');
                                        } catch (error) {
                                            console.error("Logout failed:", error);
                                        }
                                    }}
                                >
                                    <ListItemIcon><LogoutIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/home')}
                            sx={{
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
                                },
                            }}
                        >
                            Back to Home
                        </Button>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', m: 0 }}>My Profile</Typography>
                    </Box>
                    <Card sx={{
                        borderRadius: 4,
                        boxShadow: (theme) => theme.palette.mode === 'light' ? '0 12px 30px rgba(15,23,42,0.04)' : 'none',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'visible'
                    }}>
                        <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4, flexDirection: { xs: 'column', md: 'row' }, textAlign: { xs: 'center', md: 'left' } }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar src={user.profilePhoto} sx={{ width: 120, height: 120, border: '4px solid', borderColor: 'background.paper', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>{user.firstName} {user.lastName}</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>{user.major}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1, color: 'text.secondary' }}>
                                    <BusinessIcon fontSize="small" />
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.university}</Typography>
                                </Box>

                                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                    <StarRatingDisplay averageRating={user.averageRating} ratingsCount={user.ratingsCount} size="medium" />
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", md: "flex-start" }, gap: 4, mt: 2 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: 22, fontWeight: 900, color: "primary.main", lineHeight: 1 }}>
                                            {userItems.filter(i => i.status !== "sold").length}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", mt: 0.5 }}>Available</Typography>
                                    </Box>
                                    <Box sx={{ width: "1.5px", height: "25px", bgcolor: "divider" }} />
                                    <Box>
                                        <Typography sx={{ fontSize: 22, fontWeight: 900, color: "error.main", lineHeight: 1 }}>
                                            {userItems.filter(i => i.status === "sold").length}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", mt: 0.5 }}>Sold</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    sx={{ borderRadius: "14px", textTransform: 'none', px: 3, fontWeight: 700, py: 1.2 }}
                                    onClick={handleOpenEditModal}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<LockResetIcon />}
                                    sx={{
                                        borderRadius: "14px",
                                        textTransform: 'none',
                                        px: 3,
                                        fontWeight: 800,
                                        py: 1.2,
                                        background: (theme) => theme.palette.mode === 'light'
                                            ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                                            : "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                                    }}
                                    onClick={() => setIsResetModalOpen(true)}
                                >
                                    Reset Password
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'stretch' }}>
                        <Box sx={{ width: { xs: '100%', md: '350px' }, flexShrink: 0 }}>
                            <Card sx={{
                                borderRadius: 4,
                                height: '100%',
                                boxShadow: (theme) => theme.palette.mode === 'light' ? '0 12px 30px rgba(15,23,42,0.04)' : 'none',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Personal Information</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <InfoItem icon={<EmailIcon />} label="Email Address" value={user.email} />
                                        <InfoItem icon={<PhoneIcon />} label="Phone Number" value={user.phoneNumber} />
                                        <InfoItem icon={<SchoolIcon />} label="Faculty" value={user.faculty} />
                                        <InfoItem icon={<BusinessIcon />} label="University" value={user.university} />
                                    </Box>
                                    <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: "background.subtle", border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'primary.main' }}>Student Verification</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>Your account is verified as a current student.</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                            <CheckCircleIcon fontSize="small" />
                                            <Typography variant="caption" sx={{ fontWeight: 800 }}>Status: Active</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>The Recent Items</Typography>
                                {userItems.length > 0 && <Button variant="text" color="primary" sx={{ textTransform: 'none', fontWeight: 600 }} onClick={() => navigate('/my-listings')}>View All</Button>}
                            </Box>

                            {userItems.length > 0 ? (
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                                        gap: 3,
                                        width: "100%",
                                        alignItems: "stretch",
                                    }}
                                >
                                    {userItems.slice(0, 2).map((item) => (
                                        <Box key={item.id} sx={{ display: 'flex' }}>
                                            <Card
                                                sx={{
                                                    borderRadius: "24px",
                                                    overflow: "hidden",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    backgroundColor: "background.paper",
                                                    boxShadow: (theme) => theme.palette.mode === 'light' ? "0 8px 24px rgba(15,23,42,0.06)" : "none",
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
                                                        fontSize: 12, fontWeight: 800, color: 'white', zIndex: 2,
                                                        bgcolor: item.status === "sold" ? 'error.main' : 'success.main',
                                                        boxShadow: "0 6px 18px rgba(0,0,0,0.2)"
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
                                                            transition: "transform 0.4s ease",
                                                            "&:hover": {
                                                                transform: "scale(1.05)",
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
                                                            color: "text.primary",
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

                                                    <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 900, mt: 1.2, fontSize: "1.25rem", height: "38px" }}>
                                                        {item.price ? `${item.price} EGP` : "Price not available"}
                                                    </Typography>

                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.2, height: "28px" }}>
                                                        <LocationOnIcon sx={{ fontSize: 17, color: "text.secondary" }} />
                                                        <Typography component="span" sx={{ fontSize: "0.92rem", color: "text.secondary", fontWeight: 600, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                            {item.university || "University not specified"}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ mt: 1.2, height: "32px" }}>
                                                        <Chip
                                                            icon={<VerifiedOutlinedIcon />}
                                                            label={item.condition || "Condition not specified"}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: () =>
                                                                    item.condition === "New" ? "rgba(16, 185, 129, 0.1)" :
                                                                        item.condition === "Like New" ? "rgba(37, 99, 235, 0.1)" :
                                                                            "rgba(245, 158, 11, 0.1)",
                                                                color: item.condition === "New" ? "success.main" : item.condition === "Like New" ? "primary.main" : "warning.main",
                                                                fontWeight: 800,
                                                                borderRadius: "10px",
                                                                "& .MuiChip-icon": { color: 'inherit' },
                                                            }}
                                                        />
                                                    </Box>

                                                    <Typography sx={{ mt: 1.4, fontSize: "0.9rem", color: "text.secondary", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", height: "48px", fontWeight: 500 }}>
                                                        {item.description || "No description available"}
                                                    </Typography>

                                                    <Box sx={{ flexGrow: 1 }} />
                                                    <Divider sx={{ my: 2 }} />

                                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', height: "58px", width: "100%" }}>
                                                        {item.status !== "sold" && (
                                                            <Button
                                                                fullWidth
                                                                variant="contained"
                                                                size="small"
                                                                sx={{
                                                                    borderRadius: "12px",
                                                                    textTransform: 'none',
                                                                    bgcolor: 'success.main',
                                                                    '&:hover': { bgcolor: 'success.dark' },
                                                                    height: '40px',
                                                                    whiteSpace: 'nowrap',
                                                                    minWidth: 0,
                                                                    px: 2,
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: 700,
                                                                    boxShadow: 'none'
                                                                }}
                                                                onClick={() => handleMarkAsSold(item.id)}
                                                            >
                                                                Mark Sold
                                                            </Button>
                                                        )}
                                                        <Button
                                                            fullWidth
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<EditIcon sx={{ fontSize: '1.1rem !important' }} />}
                                                            sx={{
                                                                borderRadius: "12px",
                                                                textTransform: 'none',
                                                                height: '40px',
                                                                whiteSpace: 'nowrap',
                                                                minWidth: 0,
                                                                px: 2,
                                                                fontSize: '0.9rem',
                                                                fontWeight: 700,
                                                                borderColor: 'divider',
                                                                color: 'text.primary',
                                                                '&:hover': { borderColor: 'text.secondary', bgcolor: 'background.subtle' }
                                                            }}
                                                            onClick={() => handleOpenEditListing(item)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'background.subtle',
                                                                borderRadius: "12px",
                                                                color: 'text.secondary',
                                                                '&:hover': { bgcolor: 'error.light', color: 'error.main' },
                                                                height: '40px',
                                                                width: '40px',
                                                                flexShrink: 0
                                                            }}
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
                                <Typography sx={{ color: '#64748b', fontSize: '1.1rem' }}>You have not posted any listings yet.</Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Edit Profile Modal */}
            <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1, backgroundImage: 'none' } }}>
                <DialogTitle sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PersonIcon color="primary" /> Edit Profile Information
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, position: 'relative' }}>
                        <Avatar src={editData.profilePhoto} sx={{ width: 100, height: 100, mb: 1, border: '4px solid', borderColor: 'background.paper', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <IconButton sx={{ position: 'absolute', bottom: 35, right: 'calc(50% - 50px)', bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }} size="small" onClick={() => fileInputRef.current.click()}>
                            <PhotoCameraIcon fontSize="small" />
                        </IconButton>
                        <input type="file" hidden ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" />
                        <Button size="small" onClick={() => fileInputRef.current.click()}>Change Profile Photo</Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField fullWidth label="First Name" name="firstName" value={editData.firstName} onChange={handleInputChange} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label="Last Name" name="lastName" value={editData.lastName} onChange={handleInputChange} /></Grid>
                        </Grid>
                        <TextField fullWidth label="Phone Number" name="phoneNumber" value={editData.phoneNumber} onChange={handleInputChange} />
                        <TextField select fullWidth label="University" name="university" value={editData.university || ""} onChange={handleInputChange}>
                            {universities.map((uni) => <MenuItem key={uni} value={uni}>{uni}</MenuItem>)}
                        </TextField>
                        {editData.university === "Others" && (
                            <TextField fullWidth label="Enter Your University" value={customUniversity} onChange={(e) => setCustomUniversity(e.target.value)} />
                        )}
                        <TextField select fullWidth label="Faculty" name="faculty" value={editData.faculty || ""} onChange={handleInputChange}>
                            {faculties.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                        </TextField>
                        {editData.faculty === "Others" && (
                            <TextField fullWidth label="Enter Your Faculty" value={customFaculty} onChange={(e) => setCustomFaculty(e.target.value)} />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsEditModalOpen(false)} sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveProfile} sx={{ bgcolor: 'primary.main', borderRadius: 2, px: 4, fontWeight: 800, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>Save Changes</Button>
                </DialogActions>
            </Dialog>
            {/* Edit Listing Modal */}
            <Dialog open={isEditListingModalOpen} onClose={() => setIsEditListingModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1, backgroundImage: 'none' } }}>
                <DialogTitle sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EditIcon color="primary" /> Edit Listing
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={currentEditItem?.title || ''}
                            onChange={(e) => setCurrentEditItem(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={currentEditItem?.description || ''}
                            onChange={(e) => setCurrentEditItem(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select label="Category" value={currentEditItem?.category || ''} onChange={(e) => setCurrentEditItem(prev => ({ ...prev, category: e.target.value }))}>
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
                        <FormControl fullWidth>
                            <InputLabel>Condition</InputLabel>
                            <Select label="Condition" value={currentEditItem?.condition || ''} onChange={(e) => setCurrentEditItem(prev => ({ ...prev, condition: e.target.value }))}>
                                <MenuItem value="New">New</MenuItem>
                                <MenuItem value="Like New">Like New</MenuItem>
                                <MenuItem value="Good">Good</MenuItem>
                                <MenuItem value="Fair">Fair</MenuItem>
                                <MenuItem value="Poor">Poor</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={currentEditItem?.price || ''}
                            onChange={(e) => setCurrentEditItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        />
                        <TextField
                            fullWidth
                            label="Available Quantity"
                            type="number"
                            value={currentEditItem?.quantityAvailable ?? 1}
                            onChange={(e) => setCurrentEditItem(prev => ({ ...prev, quantityAvailable: e.target.value }))}
                            inputProps={{ min: 0, step: 1 }}
                            helperText="Number of units available (0 = out of stock)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsEditListingModalOpen(false)} sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveListing} sx={{ bgcolor: 'primary.main', borderRadius: 2, px: 4, fontWeight: 800, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Reset Password Modal (Same Design as Edit Profile) */}
            <Dialog open={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1, backgroundImage: 'none' } }}>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LockResetIcon color="primary" /> Reset Password
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Enter your new password below to update your account security.</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Hidden username field to trap browser autofill and prevent it from filling the search bar */}
                        <input type="text" name="email" value={user.email} style={{ display: 'none' }} readOnly autoComplete="username" />
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            autoComplete="new-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showPassword ? "text" : "password"}
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            autoComplete="new-password"
                        />
                        <Box sx={{ p: 2, bgcolor: 'background.subtle', borderRadius: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}>PASSWORD REQUIREMENTS:</Typography>
                            <Grid container spacing={1}>
                                <RequirementItem label="At least 8 characters" met={passwords.new.length >= 8} />
                                <RequirementItem label="One uppercase letter" met={/[A-Z]/.test(passwords.new)} />
                                <RequirementItem label="One special character" met={/[!@#$%^&*(),.?":{}|<>]/.test(passwords.new)} />
                                <RequirementItem label="One number" met={/[0-9]/.test(passwords.new)} />
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsResetModalOpen(false)} sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleResetPassword} sx={{ bgcolor: 'primary.main', borderRadius: 2, px: 4, fontWeight: 800, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>Update Password</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1, backgroundImage: 'none' } }}>
                <DialogTitle sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <DeleteIcon color="error" /> Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>Are you sure you want to delete this item? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsDeleteDialogOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={confirmDeleteListing} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 4, boxShadow: 'none' }}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600 }}>{snackbar.message}</Alert>
            </Snackbar>
            <Footer />
        </Box>
    );
}

function InfoItem({ icon, label, value }) {
    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ bgcolor: 'background.subtle', color: 'primary.main', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center' }}>{icon}</Box>
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>{label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{value}</Typography>
            </Box>
        </Box>
    );
}

function RequirementItem({ label, met }) {
    return (
        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: met ? 1 : 0.5 }}>
            <CheckCircleIcon sx={{ fontSize: 14, color: met ? '#22c55e' : '#cbd5e1' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
        </Grid>
    );
}