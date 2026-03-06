import { Box, Grid, Typography, Button, TextField } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CategoryBar from "../components/CategoryBar";
import TopSection from "../components/TopSection"; // ✅ correct name
import ItemCard from "../components/ItemCard";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; 

export default function Home() {
    
// State for items, search query, and selected category
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
       
// Fetch items from Firestore on component mount
    useEffect(() => {
        const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data);
      },
      (error) => console.error("Error fetching products:", error)
    );

    return () => unsubscribe();
  }, []);
    // Categories for filtering
  const categories = [
    { name: "All" },
    { name: "Books" },
    { name: "Calculators" },
    { name: "Laptops" },
    { name: "Engineering" },
    { name: "Medical" },
  ];

  // Filter items based on search query and selected category
    const filteredItems = items.filter((item) => {
        const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchSearch && matchCategory;
});

     return (
    <Box sx={{ backgroundColor: "#f5f7fb", minHeight: "100vh" }}>
      {/* Navbar */}
      <Navbar />

      {/* Top Section */}
      <TopSection />

      <Box sx={{ display: "flex" }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box sx={{ flex: 1, px: 5, py: 4 }}>
          {/* Categories Buttons */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <Button
                key={cat.name}
                variant={selectedCategory === cat.name ? "contained" : "outlined"}
                color="primary"
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </Button>
            ))}
          </Box>

          {/* Search Input */}
          <TextField
            fullWidth
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 4 }}
          />

          {/* Title */}
          <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 4 }}>
            All Listings
          </Typography>

          {/* Products Grid */}
          <Grid container spacing={4}>
            {filteredItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <ItemCard item={item} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );}