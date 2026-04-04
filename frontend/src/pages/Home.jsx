import { Box, Typography, Paper, Chip, Fab, FormControl, Select, MenuItem } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SortIcon from "@mui/icons-material/Sort";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CategoryBar from "../components/CategoryBar";
import TopSection from "../components/Topsection";
import ItemCard from "../components/ItemCard";
import Footer from "../components/Footer";
import EmptyState from "../components/EmptyState";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function Home() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedUniversity, setSelectedUniversity] = useState("All Universities");
  const [priceRange, setPriceRange] = useState([0, 7000]);
  const [selectedConditions, setSelectedConditions] = useState([]); // array of strings: ["New", "Like New", ...]
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(50);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        data.sort((a, b) => {
          const getTime = (val) => {
            if (!val) return Date.now(); 
            if (val.seconds) return val.seconds * 1000;
            if (val instanceof Date) return val.getTime();
            if (typeof val.getTime === "function") return val.getTime();
            return 0;
          };
          return getTime(b.createdAt) - getTime(a.createdAt);
        });
        setItems(data);
      },
      (error) => console.error("Error fetching products:", error)
    );

    return () => unsubscribe();
  }, []);

  const standardUniversities = [
    "Cairo University", "Ain Shams University", "Alexandria University",
    "Mansoura University", "Assiut University", "Helwan University",
    "Tanta University", "Zagazig University", "Suez Canal University",
    "Al-Azhar University", "German University in Cairo", "British University in Egypt",
    "October 6 University", "Future University in Egypt", "AASTMT", "Nile University"
  ];

  const filteredItems = items.filter((item) => {
    const itemTitle = item.title?.toLowerCase() || "";
    const itemDescription = item.description?.toLowerCase() || "";
    const searchValue = search.toLowerCase();
    // condition filtering
    const matchCondition =
      selectedConditions.length === 0 ||
      selectedConditions.includes(item.condition);
    // price filtering
    const matchPrice =
      item.price >= priceRange[0] && item.price <= priceRange[1];

    // university filtering
    const matchUniversity =
      selectedUniversity === "All Universities" ||
      item.university === selectedUniversity ||
      (selectedUniversity === "Others" && !standardUniversities.includes(item.university));

    const matchSearch =
      itemTitle.includes(searchValue) ||
      itemDescription.includes(searchValue);

    const matchCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    // status filtering (only show available items)
    const matchStatus =
      item.status === "available" || item.status === undefined;

    return matchSearch && matchCategory && matchStatus && matchCondition && matchPrice && matchUniversity;
  }).sort((a, b) => {
    if (sortBy === "price_low_high") return a.price - b.price;
    if (sortBy === "price_high_low") return b.price - a.price;
    
    // sort by newest by default
    const getTime = (val) => {
      if (!val) return Date.now();
      if (val.seconds) return val.seconds * 1000;
      if (val instanceof Date) return val.getTime();
      if (typeof val.getTime === "function") return val.getTime();
      return 0;
    };
    return getTime(b.createdAt) - getTime(a.createdAt);
  });

  const displayedItems = filteredItems.slice(0, visibleCount);

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f8fbff 0%, #f5f7fb 35%, #eef4ff 100%)",
        }}
      >
        <Navbar />

        <TopSection search={search} setSearch={setSearch} />

        <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 4 } }}>
          <CategoryBar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 3, md: 4 },
              mt: { xs: 2, md: 1 },
            }}
          >
            <Sidebar
              selectedUniversity={selectedUniversity}
              setSelectedUniversity={setSelectedUniversity}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedConditions={selectedConditions}
              setSelectedConditions={setSelectedConditions}
            />

            <Box sx={{ flex: 1, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  mb: 4,
                  p: { xs: 2.5, md: 3 },
                  borderRadius: "24px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 30px rgba(15, 23, 42, 0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    flexDirection: { xs: "column", md: "row" },
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                      All Listings
                    </Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#64748b", lineHeight: 1.7 }}>
                      Explore campus deals and discover useful student items in one place.
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        displayEmpty
                        IconComponent={SortIcon}
                        sx={{
                          borderRadius: "12px",
                          backgroundColor: "#f8fafc",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          color: "#334155",
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
                        }}
                      >
                        <MenuItem value="newest">Newest First</MenuItem>
                        <MenuItem value="price_low_high">Price: Low to High</MenuItem>
                        <MenuItem value="price_high_low">Price: High to Low</MenuItem>
                      </Select>
                    </FormControl>

                    <Chip
                      label={`${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""} found`}
                      sx={{
                        fontWeight: 700,
                        borderRadius: "10px",
                        backgroundColor: "#e0ecff",
                        color: "#1d4ed8",
                        display: { xs: "none", sm: "flex" },
                      }}
                    />
                  </Box>
                </Box>
              </Paper>

              {filteredItems.length > 0 ? (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 3,
                      width: "100%",
                    }}
                  >
                    {displayedItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </Box>

                  {visibleCount < filteredItems.length && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setVisibleCount((prev) => prev + 50)}
                        sx={{
                          borderRadius: "14px",
                          px: 6,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 800,
                          fontSize: "1rem",
                          border: "2px solid #2563eb",
                          color: "#2563eb",
                          "&:hover": {
                            border: "2px solid #1d4ed8",
                            bgcolor: "rgba(37, 99, 235, 0.04)",
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        View More Items
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <EmptyState
                  title="No Items Found"
                  description="We couldn't find any items matching your current filters. Try adjusting your search or filters to see more results."
                  iconType="shopping"
                />
              )}
            </Box>
          </Box>
        </Box>
        <Footer />
      </Box>

      <Fab
        onClick={scrollToTop}
        size="medium"
        aria-label="scroll to top"
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(37, 99, 235, 0.35)",
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          pointerEvents: showScrollTop ? "auto" : "none",
          "&:hover": {
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            boxShadow: "0 10px 30px rgba(37, 99, 235, 0.45)",
          },
          zIndex: 1000,
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </>
  );
}