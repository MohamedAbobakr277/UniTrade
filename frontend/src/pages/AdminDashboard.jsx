import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CategoryBar from "../components/CategoryBar";
import TopSection from "../components/TopSection";

export default function AdminDashboard() {
    const stats = [
        { label: "Total Listings", value: "742", change: "+12%", color: "#3b82f6" },
        { label: "Active Users", value: "1,240", change: "+5.4%", color: "#8b5cf6" },
    ];

    const recentItems = [
        {
            id: 1,
            title: "Engineering Toolbox",
            user: "Alex Rivers",
            condition: "Like New",
            date: "Oct 24, 2023",
            image: "https://images.unsplash.com/photo-1581093588401-22f7c1b3e9b5",
        },
        {
            id: 2,
            title: "Scientific Calculator",
            user: "Jordan Smith",
            condition: "Like New",
            date: "Oct 23, 2023",
            image: "https://images.unsplash.com/photo-1581090700227-4c4f50c1e2c6",
        },
        {
            id: 3,
            title: "Laptop",
            user: "Sarah Jenkins",
            condition: "Like New",
            date: "Oct 22, 2023",
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        },
    ];

    return (
        <Box sx={{ backgroundColor: "#f5f7fb", minHeight: "100vh" }}>
            <Navbar />
            <TopSection />

            <Box sx={{ display: "flex" }}>
                <Sidebar />

                <Box sx={{ flex: 1, px: 5, py: 4 }}>
                    <CategoryBar />

                    <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 1, mt: 2 }}>
                        Admin Overview
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mb: 4 }}>
                        Welcome back, here is what is happening today.
                    </Typography>

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 5 }}>
                        {stats.map((stat, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Paper sx={{ p: 3, borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                        <Typography color="text.secondary" fontWeight={500}>
                                            {stat.label}
                                        </Typography>
                                        <Chip
                                            label={stat.change}
                                            size="small"
                                            sx={{ bgcolor: "#eef2ff", color: "#4f46e5", fontWeight: 700, borderRadius: "8px" }}
                                        />
                                    </Box>
                                    <Typography variant="h3" fontWeight={800}>
                                        {stat.value}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Recent Items Table */}
                    <Paper sx={{ p: 4, borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography variant="h6" fontWeight={700}>
                                Recent Items Added
                            </Typography>
                            <Typography sx={{ color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}>
                                View All
                            </Typography>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: 12 }}>Listing</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: 12 }}>User</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: 12 }}>Condition</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", fontSize: 12 }}>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentItems.map((item) => (
                                        <TableRow key={item.id} sx={{ "&:last-child td": { border: 0 } }}>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                    <Box
                                                        component="img"
                                                        src={item.image}
                                                        sx={{ width: 48, height: 48, borderRadius: "8px", objectFit: "cover" }}
                                                    />
                                                    <Typography fontWeight={600}>{item.title}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{item.user}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.condition}
                                                    size="small"
                                                    sx={{ bgcolor: "#ecfdf5", color: "#10b981", fontWeight: 600, borderRadius: "8px" }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: "text.secondary" }}>{item.date}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}
