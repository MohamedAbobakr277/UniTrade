import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

// --- MOCK DATA ---
const initialStats = [
    { label: "Total Listings", value: "1,284", change: "+12.5%", color: "#3b82f6" },
    { label: "Active Users", value: "856", change: "+5.2%", color: "#8b5cf6" },
];

const initialListings = [
    { id: "LST-7729", title: "MacBook Pro 2021", description: "M1 Max, 32GB RAM, 1TB SSD. Space Gray.", price: 1200, category: "Electronics", user: "Alex Chen", condition: "Like New", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8" },
    { id: "LST-8812", title: "Economics Textbook", description: "12th Edition, no highlighting.", price: 45, category: "Books", user: "Sarah Miller", condition: "Good", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c" },
    { id: "LST-4122", title: "Ergonomic Office Chair", description: "Adjustable lumbar support.", price: 150, category: "Furniture", user: "Jason Todd", condition: "Sold", image: "https://images.unsplash.com/photo-1505797149-43b007662c21" },
];

const initialUsers = [
    { id: "USR-001", name: "Jordan Rivera", email: "j.rivera@uni.edu", university: "University of Toronto", faculty: "Engineering", status: "Verified" },
    { id: "USR-002", name: "Maya Williams", email: "m.williams@uni.edu", university: "McGill University", faculty: "Business", status: "Pending" },
];

const categories = ["Electronics", "Books", "Furniture", "Sports", "Fashion", "Other"];
const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [listings, setListings] = useState(initialListings);
    const [users, setUsers] = useState(initialUsers);

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', category: '', price: '', condition: '' });
    const [addForm, setAddForm] = useState({ title: '', description: '', category: 'Electronics', price: '', condition: 'New' });
    const [itemToDelete, setItemToDelete] = useState(null);

    // Handlers
    const handleOpenEdit = (item) => {
        setSelectedItem(item);
        setEditForm({ ...item });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        setListings(prev => prev.map(item => item.id === selectedItem.id ? { ...item, ...editForm, price: parseFloat(editForm.price) } : item));
        setIsEditModalOpen(false);
    };

    const handleOpenAdd = () => {
        setAddForm({ title: '', description: '', category: 'Electronics', price: '', condition: 'New' });
        setIsAddModalOpen(true);
    };

    const handleSaveAdd = () => {
        const newId = `LST-${Math.floor(1000 + Math.random() * 9000)}`;
        const newItem = {
            ...addForm,
            id: newId,
            price: parseFloat(addForm.price) || 0,
            user: "Admin",
            image: "https://images.unsplash.com/photo-1581093588401-22f7c1b3e9b5"
        };
        setListings(prev => [newItem, ...prev]);
        setIsAddModalOpen(false);
    };

    const handleConfirmDelete = () => {
        setListings(prev => prev.filter(item => item.id !== itemToDelete.id));
        setIsDeleteModalOpen(false);
    };

    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await logout();
            // Send a state object containing the message along with the navigation
            navigate('/login', { state: { successMessage: "You have successfully logged out." } });
        } catch (error) {
            console.error('Error logging out:', error.message);
        }
    };

    // Render Views
    const renderDashboard = () => (
        <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Admin Overview</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>Monitor and manage all campus trade activities.</Typography>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                {initialStats.map((stat, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eef2f6' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography color="text.secondary" sx={{ fontWeight: 600 }}>{stat.label}</Typography>
                                <Chip label={stat.change} size="small" sx={{ bgcolor: '#ecfdf5', color: '#10b981', fontWeight: 700 }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eef2f6' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Recent Items Added</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>ITEM</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>USER</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>STATUS</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>DATE</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listings.slice(0, 3).map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={item.image} variant="rounded" sx={{ width: 40, height: 40 }} />
                                            <Typography sx={{ fontWeight: 600 }}>{item.title}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{item.user}</TableCell>
                                    <TableCell>
                                        <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.65rem' }} />
                                    </TableCell>
                                    <TableCell color="text.secondary">Oct 24, 2023</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );

    const renderListings = () => (
        <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Listings Management</Typography>
                <Button variant="contained" onClick={handleOpenAdd} sx={{ bgcolor: '#2563eb', borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}>
                    + New Listing
                </Button>
            </Box>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eef2f6' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>ITEM</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>PRICE</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>CATEGORY</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>USER</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listings.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={item.image} variant="rounded" />
                                            <Box>
                                                <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">ID: {item.id}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#2563eb' }}>${item.price.toFixed(2)}</TableCell>
                                    <TableCell><Chip label={item.category} size="small" sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} /></TableCell>
                                    <TableCell>{item.user}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenEdit(item)} sx={{ color: '#64748b' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setItemToDelete(item); setIsDeleteModalOpen(true); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );

    const renderUsers = () => (
        <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Recent Student Registrations</Typography>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eef2f6' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>NAME</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>UNIVERSITY</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>FACULTY</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>STATUS</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>ACTION</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 700 }}>{user.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                    </TableCell>
                                    <TableCell>{user.university}</TableCell>
                                    <TableCell>{user.faculty}</TableCell>
                                    <TableCell>
                                        <Chip label={user.status} color={user.status === 'Verified' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button variant="text" size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>View Profile</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );

    return (
        <Box sx={{ bgcolor: '#f5f7fb', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', px: 5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img src={logo} alt="UniTrade" style={{ height: '50px' }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#1e293b' }}>UniTrade</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>Admin User</Typography>
                    <Avatar sx={{ bgcolor: '#2563eb' }}>A</Avatar>
                </Box>
            </Box>

            <Box sx={{ display: 'flex' }}>
                {/* Sidebar */}
                <Box sx={{ width: 280, borderRight: '1px solid #e2e8f0', bgcolor: 'white', minHeight: 'calc(100vh - 83px)', p: 3 }}>
                    <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <ListItem disablePadding>
                            <ListItemButton selected={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: '#eff6ff', color: '#2563eb' } }}>
                                <ListItemIcon><DashboardIcon color={activeTab === 'dashboard' ? 'primary' : 'inherit'} /></ListItemIcon>
                                <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600 }} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton selected={activeTab === 'listings'} onClick={() => setActiveTab('listings')} sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: '#eff6ff', color: '#2563eb' } }}>
                                <ListItemIcon><ListAltIcon color={activeTab === 'listings' ? 'primary' : 'inherit'} /></ListItemIcon>
                                <ListItemText primary="Listings" primaryTypographyProps={{ fontWeight: 600 }} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton selected={activeTab === 'users'} onClick={() => setActiveTab('users')} sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: '#eff6ff', color: '#2563eb' } }}>
                                <ListItemIcon><PeopleIcon color={activeTab === 'users' ? 'primary' : 'inherit'} /></ListItemIcon>
                                <ListItemText primary="Users" primaryTypographyProps={{ fontWeight: 600 }} />
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <Divider sx={{ my: 3 }} />
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: '#ef4444' }}>
                                <ListItemIcon><LogoutIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                                <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>

                {/* Content Area */}
                <Box sx={{ flex: 1, p: 5 }}>
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'listings' && renderListings()}
                    {activeTab === 'users' && renderUsers()}
                </Box>
            </Box>

            {/* Modals */}
            <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Add New Listing</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                    <TextField fullWidth label="Item Name" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} />
                    <TextField fullWidth multiline rows={3} label="Description" value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField select fullWidth label="Category" value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}>{categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}</TextField>
                        <TextField fullWidth label="Price" type="number" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} />
                    </Box>
                    <TextField select fullWidth label="Condition" value={addForm.condition} onChange={(e) => setAddForm({ ...addForm, condition: e.target.value })}>{conditions.map(cond => <MenuItem key={cond} value={cond}>{cond}</MenuItem>)}</TextField>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsAddModalOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveAdd} sx={{ bgcolor: '#2563eb', fontWeight: 700 }}>Post Listing</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Edit Listing</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                    <TextField fullWidth label="Item Name" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                    <TextField fullWidth multiline rows={3} label="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField select fullWidth label="Category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>{categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}</TextField>
                        <TextField fullWidth label="Price" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsEditModalOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEdit} sx={{ bgcolor: '#2563eb', fontWeight: 700 }}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
                <DialogContent><Typography>Are you sure you want to delete <strong>{itemToDelete?.title}</strong>? This action cannot be undone.</Typography></DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsDeleteModalOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleConfirmDelete} sx={{ fontWeight: 700 }}>Delete</Button>
                </DialogActions>
            </Dialog>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Box>
    );
}