import { Box, Typography, Paper, Chip } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CategoryBar from "../components/CategoryBar";
import TopSection from "../components/Topsection";
import ItemCard from "../components/ItemCard";
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

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        data.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
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
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fbff 0%, #f5f7fb 35%, #eef4ff 100%)",
      }}
    >
      <Navbar />

      <TopSection search={search} setSearch={setSearch} />

      <Box sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 4 } }}>
        <CategoryBar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

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
                <Typography
                  sx={{
                    fontSize: { xs: 24, md: 28 },
                    fontWeight: 800,
                    color: "#0f172a",
                    mb: 0.5,
                  }}
                >
                  All Listings
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    color: "#64748b",
                    lineHeight: 1.7,
                  }}
                >
                  Explore campus deals and discover useful student items in one place.
                </Typography>
              </Box>

              <Chip
                label={`${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""
                  } found`}
                sx={{
                  fontWeight: 700,
                  borderRadius: "999px",
                  backgroundColor: "#e0ecff",
                  color: "#1d4ed8",
                }}
              />
            </Box>
          </Paper>

          {filteredItems.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 3,
                width: "100%",
                alignItems: "stretch",
              }}
            >
              {filteredItems.map((item) => (
                <Box key={item.id} sx={{ display: "flex" }}>
                  <ItemCard item={item} />
                </Box>
              ))}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: "24px",
                backgroundColor: "#ffffff",
                border: "1px dashed #cbd5e1",
              }}
            >
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#0f172a",
                  mb: 1,
                }}
              >
                No items found
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.95rem",
                  color: "#64748b",
                  lineHeight: 1.7,
                }}
              >
                Try another search or browse a different category.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
    </Box>
  );
}