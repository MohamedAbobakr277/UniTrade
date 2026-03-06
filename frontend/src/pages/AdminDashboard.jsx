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
} from '@mui/material';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../assets/logo.png';

// --- MOCK DATA ---
const initialStats = [
    { label: "Total Listings", value: "742", change: "+12%", color: "#3b82f6" },
    { label: "Active Users", value: "1,240", change: "+5.4%", color: "#8b5cf6" },
];

const initialListings = [
    { id: "LST-7729", title: "Film Camera Pro 35mm", description: "Excellent condition vintage camera from the 1970s.", price: 120, category: "Electronics", user: "John Doe", condition: "Like New", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32" },
    { id: "LST-8812", title: "Mountain Bike", description: "Rugged bike for campus trails.", price: 450, category: "Sports", user: "Jane Smith", condition: "Good", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e" },
];

const initialUsers = [
    { id: "USR-001", name: "Alex Johnson", email: "alex.j@uni.edu", university: "State University", faculty: "Engineering", status: "Verified" },
    { id: "USR-002", name: "Maria Garcia", email: "m.garcia@college.edu", university: "City Institute", faculty: "Arts", status: "Verified" },
];

const categories = ["Electronics", "Books", "Furniture", "Sports", "Fashion", "Other"];
const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [listings, setListings] = useState(initialListings);
    const [users, setUsers] = useState(initialUsers);

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', category: '', price: '', condition: '' });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // --- ADD NEW LISTING STATE ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        title: '',
        description: '',
        category: 'Electronics',
        price: '',
        condition: 'New',
        user: 'Admin', // Default for admin-created listings
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32' // Placeholder
    });

    // Handlers for Listings
    const handleOpenEdit = (item) => {
        setSelectedItem(item);
        setEditForm({ ...item });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        setListings(prev => prev.map(item => item.id === selectedItem.id ? { ...item, ...editForm } : item));
        setIsEditModalOpen(false);
    };

    const handleConfirmDelete = () => {
        setListings(prev => prev.filter(item => item.id !== itemToDelete.id));
        setIsDeleteModalOpen(false);
    };

    // --- ADD NEW LISTING HANDLERS ---
    const handleOpenAdd = () => {
        setAddForm({
            title: '',
            description: '',
            category: 'Electronics',
            price: '',
            condition: 'New',
            user: 'Admin',
            image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'
        });
        setIsAddModalOpen(true);
    };

    const handleSaveAdd = () => {
        const newId = `LST-${Math.floor(1000 + Math.random() * 9000)}`;
        const newItem = {
            ...addForm,
            id: newId,
            price: parseFloat(addForm.price) || 0
        };
        setListings(prev => [newItem, ...prev]);
        setIsAddModalOpen(false);
    };

    // Render Views
    const renderDashboard = () => (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Admin Overview</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>Welcome back! Here's what's happening today.</Typography>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                {initialStats.map((stat, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary" fontWeight={600}>{stat.label}</Typography>
                                <Chip label={stat.change} size="small" sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 700 }} />
                            </Box>
                            <Typography variant="h3" fontWeight={800}>{stat.value}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Recent Items Added</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>LISTING</TableCell>
                                <TableCell>USER</TableCell>
                                <TableCell>CONDITION</TableCell>
                                <TableCell>DATE</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listings.slice(0, 3).map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={item.image} variant="rounded" />
                                            <Typography fontWeight={600}>{item.title}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{item.user}</TableCell>
                                    <TableCell><Chip label={item.condition} size="small" color="success" variant="outlined" /></TableCell>
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
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Listings Management</Typography>
                <Button
                    variant="contained"
                    sx={{ bgcolor: '#2563eb', textTransform: 'none' }}
                    onClick={handleOpenAdd}
                >
                    + Add New Listing
                </Button>
            </Box>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell>ITEM</TableCell>
                                <TableCell>PRICE</TableCell>
                                <TableCell>CATEGORY</TableCell>
                                <TableCell>USER</TableCell>
                                <TableCell align="right">ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {listings.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={item.image} variant="rounded" />
                                            <Box>
                                                <Typography fontWeight={700}>{item.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">ID: {item.id}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#2563eb' }}>${item.price}</TableCell>
                                    <TableCell><Chip label={item.category} size="small" /></TableCell>
                                    <TableCell>{item.user}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleOpenEdit(item)}><EditIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => { setItemToDelete(item); setIsDeleteModalOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
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
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 4 }}>Users Management</Typography>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell>USER</TableCell>
                                <TableCell>UNIVERSITY</TableCell>
                                <TableCell>FACULTY</TableCell>
                                <TableCell>STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Typography fontWeight={700}>{user.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                    </TableCell>
                                    <TableCell>{user.university}</TableCell>
                                    <TableCell>{user.faculty}</TableCell>
                                    <TableCell><Chip label={user.status} color="success" size="small" /></TableCell>
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
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', px: 5, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <img src={logo} alt="UniTrade" style={{ height: '50px' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>UniTrade</Typography>
            </Box>

            <Box sx={{ display: 'flex' }}>
                <Box sx={{ width: 280, borderRight: '1px solid #e2e8f0', bgcolor: 'white', minHeight: 'calc(100vh - 83px)', p: 3 }}>
                    <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <ListItem disablePadding>
                            <ListItemButton selected={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} sx={{ borderRadius: 2 }}>
                                <ListItemIcon><DashboardIcon /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton selected={activeTab === 'listings'} onClick={() => setActiveTab('listings')} sx={{ borderRadius: 2 }}>
                                <ListItemIcon><ListAltIcon /></ListItemIcon>
                                <ListItemText primary="Listings" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton selected={activeTab === 'users'} onClick={() => setActiveTab('users')} sx={{ borderRadius: 2 }}>
                                <ListItemIcon><PeopleIcon /></ListItemIcon>
                                <ListItemText primary="Users" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <Divider sx={{ my: 3 }} />
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton sx={{ borderRadius: 2, color: 'error.main' }}>
                                <ListItemIcon><LogoutIcon sx={{ color: 'inherit' }} /></ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>

                <Box sx={{ flex: 1, p: 5 }}>
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'listings' && renderListings()}
                    {activeTab === 'users' && renderUsers()}
                </Box>
            </Box>

            {/* --- ADD NEW LISTING MODAL --- */}
            <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>Add New Listing</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Item Name"
                            value={addForm.title}
                            onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={addForm.description}
                            onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Category"
                            value={addForm.category}
                            onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                        >
                            {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={addForm.price}
                            onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Condition"
                            value={addForm.condition}
                            onChange={(e) => setAddForm({ ...addForm, condition: e.target.value })}
                        >
                            {conditions.map(cond => <MenuItem key={cond} value={cond}>{cond}</MenuItem>)}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveAdd} sx={{ bgcolor: '#2563eb' }}>Post Listing</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Listing Modal */}
            <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>Edit Listing</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField fullWidth label="Item Name" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                        <TextField fullWidth multiline rows={3} label="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                        <TextField select fullWidth label="Category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                            {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                        </TextField>
                        <TextField fullWidth label="Price" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete {itemToDelete?.title}?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleConfirmDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}