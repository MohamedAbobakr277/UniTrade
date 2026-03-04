import { Box, Grid, Typography } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CategoryBar from "../components/CategoryBar";
import TopSection from "../components/TopSection"; // ✅ correct name
import ItemCard from "../components/ItemCard";

export default function Home() {
    const items = [
        {
            id: 1,
            title: "Engineering Toolbox",
            price: 400,
            university: "Alexandria University",
            condition: "Like New",
            image:
                "https://images.unsplash.com/photo-1581093588401-22f7c1b3e9b5",
            badge: "Newly Listed",
        },
        {
            id: 2,
            title: "Scientific Calculator",
            price: 225,
            university: "Cairo University",
            condition: "Like New",
            image:
                "https://images.unsplash.com/photo-1581090700227-4c4f50c1e2c6",
            badge: "Hot Deal",
        },
        {
            id: 3,
            title: "Laptop",
            price: 7000,
            university: "Ain Shams",
            condition: "Like New",
            image:
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        },
    ];

    return (
        <Box
            sx={{
                backgroundColor: "#f5f7fb",
                minHeight: "100vh",
            }}
        >

            {/* 1️⃣ Navbar */}
            <Navbar />

            {/* 2️⃣ Search Section BELOW navbar */}
            <TopSection />

            {/* 3️⃣ Main Layout */}
            <Box sx={{ display: "flex" }}>
                <Sidebar />

                <Box
                    sx={{
                        flex: 1,
                        px: 5,
                        py: 4,
                    }}
                >
                    <CategoryBar />

                    <Typography
                        sx={{
                            fontSize: 26,
                            fontWeight: 700,
                            mb: 4,
                        }}
                    >
                        All Listings
                    </Typography>

                    <Grid container spacing={4}>
                        {items.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <ItemCard item={item} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}