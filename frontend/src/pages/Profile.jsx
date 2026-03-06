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
} from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
import logo from '../assets/logo.png';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

const universities = ["Cairo University", "Ain Shams University", "Alexandria University", "Stanford University", "Other"];
const faculties = ["Engineering", "Medicine", "Commerce", "Other"];

export default function Profile() {
    const [userItems, setUserItems] = useState([]);
    const [user, setUser] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isEditListingModalOpen, setIsEditListingModalOpen] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);

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
                where("ownerId", "==", auth.currentUser.uid)
            );

            const snapshot = await getDocs(q);

            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

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
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, editData, { merge: true }); // merge: true عشان ما يمسحش باقي البيانات
            setUser(editData);
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
        try {

            const itemRef = doc(db, "products", currentEditItem.id);

            await setDoc(itemRef, currentEditItem, { merge: true });

            setUserItems(prev =>
                prev.map(item =>
                    item.id === currentEditItem.id ? currentEditItem : item
                )
            );

            setIsEditListingModalOpen(false);

            setSnackbar({
                open: true,
                message: "Listing updated successfully",
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
    const handleDeleteListing = async (itemId) => {

        if (!auth.currentUser) return;

        const docRef = doc(db, "products", itemId);

        try {

            await deleteDoc(docRef);

            setUserItems(prev =>
                prev.filter(item => item.id !== itemId)
            );

            setSnackbar({
                open: true,
                message: "Listing deleted successfully",
                severity: "success",
            });

        } catch (error) {

            console.error("Error deleting listing:", error);

            setSnackbar({
                open: true,
                message: "Failed to delete listing",
                severity: "error",
            });

        }

    };
    if (!user) {
        return <Typography sx={{ p: 5 }}>Loading profile...</Typography>;
    }
    return (
        <Box sx={{ backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
            <Box sx={{ bgcolor: '#f5f6f8', borderBottom: '1px solid #e0e0e0', px: 5, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <img src={logo} alt="UniTrade Logo" style={{ height: '60px' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a202c', letterSpacing: '-0.02em' }}>UniTrade</Typography>
            </Box>

            <Box sx={{ display: 'flex' }}>
                <Box sx={{ width: 280, borderRight: '1px solid #e2e8f0', bgcolor: 'white', minHeight: 'calc(100vh - 93px)' }}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>{user.firstName} {user.lastName}</Typography>
                        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <ListItem disablePadding>
                                <ListItemButton selected sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: '#eff6ff', color: '#3b82f6' } }}>
                                    <ListItemIcon><PersonIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                                    <ListItemText primary="My Profile" primaryTypographyProps={{ fontWeight: 600 }} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton sx={{ borderRadius: 2 }}>
                                    <ListItemIcon><FavoriteIcon /></ListItemIcon>
                                    <ListItemText primary="Favourites" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                        <Divider sx={{ my: 3 }} />
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton sx={{ borderRadius: 2, color: '#ef4444' }}>
                                    <ListItemIcon><LogoutIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                                    <ListItemText primary="Logout" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'visible' }}>
                        <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar src={user.profilePhoto} sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{user.firstName} {user.lastName}</Typography>
                                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>{user.major}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: 'text.secondary' }}>
                                    <BusinessIcon fontSize="small" />
                                    <Typography variant="body2">{user.university}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" startIcon={<EditIcon />} sx={{ borderRadius: 3, textTransform: 'none', px: 3 }} onClick={() => { setEditData({ ...user }); setIsEditModalOpen(true); }}>Edit Profile</Button>
                                <Button variant="contained" startIcon={<LockResetIcon />} sx={{ borderRadius: 3, textTransform: 'none', px: 3, bgcolor: '#2563eb' }} onClick={() => setIsResetModalOpen(true)}>Reset Password</Button>
                            </Box>
                        </CardContent>
                    </Card>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Personal Information</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <InfoItem icon={<EmailIcon />} label="Email Address" value={user.email} />
                                        <InfoItem icon={<PhoneIcon />} label="Phone Number" value={user.phoneNumber} />
                                        <InfoItem icon={<SchoolIcon />} label="Faculty" value={user.faculty} />
                                        <InfoItem icon={<BusinessIcon />} label="University" value={user.university} />
                                    </Box>
                                    <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: '#eff6ff', border: '1px solid #dbeafe' }}>
                                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>Student Verification</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Your account is verified as a current student.</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2563eb' }}>
                                            <CheckCircleIcon fontSize="small" />
                                            <Typography variant="caption" sx={{ fontWeight: 700 }}>Status: Active</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>My Listings</Typography>
                                <Button variant="text" color="primary" sx={{ textTransform: 'none', fontWeight: 600 }}>View All</Button>
                            </Box>
                            <Grid container spacing={3}>
                                {userItems.map((item) => (
                                    <Grid item xs={12} sm={6} key={item.id}>
                                        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative' }}>
                                            <CardMedia component="img" height="180" image={item.image?.[0] || ""} />
                                            <CardContent sx={{ p: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>${Number(item.price || 0).toFixed(2)}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Posted {item.postedDate}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                    <Button fullWidth variant="outlined" size="small" startIcon={<EditIcon />} sx={{ borderRadius: 2, textTransform: 'none' }} onClick={() => handleOpenEditListing(item)}>Edit</Button>
                                                    <IconButton size="small" sx={{ bgcolor: '#f1f5f9', borderRadius: 2, color: '#64748b' }} onClick={() => handleDeleteListing(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

            {/* Edit Profile Modal */}
            <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Edit Profile Information</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, position: 'relative' }}>
                        <Avatar src={editData.profilePhoto} sx={{ width: 100, height: 100, mb: 1 }} />
                        <IconButton sx={{ position: 'absolute', bottom: 35, right: 'calc(50% - 50px)', bgcolor: '#2563eb', color: 'white', '&:hover': { bgcolor: '#1d4ed8' } }} size="small" onClick={() => fileInputRef.current.click()}>
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
                        <TextField select fullWidth label="University" name="university" value={editData.university} onChange={handleInputChange}>
                            {universities.map((uni) => <MenuItem key={uni} value={uni}>{uni}</MenuItem>)}
                        </TextField>
                        <TextField select fullWidth label="Faculty" name="faculty" value={editData.faculty} onChange={handleInputChange}>
                            {faculties.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsEditModalOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveProfile} sx={{ bgcolor: '#2563eb', borderRadius: 2, px: 4, fontWeight: 700 }}>Save Changes</Button>
                </DialogActions>
            </Dialog>
            {/*edit listing modal*/}
            <Dialog open={isEditListingModalOpen} onClose={() => setIsEditListingModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Listing</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={currentEditItem?.title || ''}
                        onChange={(e) => setCurrentEditItem(prev => ({ ...prev, title: e.target.value }))}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        value={currentEditItem?.price || ''}
                        onChange={(e) => setCurrentEditItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditListingModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveListing}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Reset Password Modal (Same Design as Edit Profile) */}
            <Dialog open={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LockResetIcon color="primary" /> Reset Password
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Enter your new password below to update your account security.</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
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
                        />
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 1, display: 'block' }}>PASSWORD REQUIREMENTS:</Typography>
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
                    <Button onClick={() => setIsResetModalOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleResetPassword} sx={{ bgcolor: '#2563eb', borderRadius: 2, px: 4, fontWeight: 700 }}>Update Password</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

function InfoItem({ icon, label, value }) {
    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ bgcolor: '#eff6ff', color: '#3b82f6', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center' }}>{icon}</Box>
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>{label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{value}</Typography>
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