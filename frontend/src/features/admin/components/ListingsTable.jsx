import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
} from "@mui/material";
import VisibilityOutlinedIcon  from "@mui/icons-material/VisibilityOutlined";
import SearchIcon              from "@mui/icons-material/Search";
import { useState }            from "react";
import ItemDetailModal         from "./ItemDetailModal";

const CATEGORIES = [
  "All Categories",
  "Books & Notes",
  "Calculators",
  "Electronics",
  "Engineering Tools",
  "Medical Tools",
  "Lab Equipment",
  "Stationery",
  "Bags & Accessories",
];

export default function ListingsTable({ listings, onEdit, onDelete }) {
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredListings = listings.filter((item) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const titleMatch = (item.title || "").toLowerCase().includes(query);
    const sellerMatch = (item.sellerName || "").toLowerCase().includes(query);
    if (!titleMatch && !sellerMatch) return false;

    // 2. Category Filter
    if (filterCategory !== "All Categories" && item.category !== filterCategory) return false;

    // 3. Status Filter
    if (filterStatus !== "all") {
      const isSold = item.status === "sold";
      if (filterStatus === "available" && isSold) return false;
      if (filterStatus === "sold" && !isSold) return false;
    }

    return true;
  });

  return (
    <Box sx={{ animation: "fadeIn 0.5s ease" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Listings Management
        </Typography>
      </Box>

      {/* ── Filters Bar ── */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search items or sellers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, bgcolor: "white", "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          size="small"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          sx={{ width: 220, bgcolor: "white", "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        >
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ width: 160, bgcolor: "white", "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="available">Available</MenuItem>
          <MenuItem value="sold">Sold</MenuItem>
        </TextField>
      </Box>

      <Paper
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid #eef2f6",
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, py: 1.5 }}>ITEM</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>PRICE</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>CATEGORY</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>SELLER</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredListings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#94a3b8" }}>
                    No listings found matching the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredListings.map((item) => (
                  <TableRow key={item.id} hover>
                  <TableCell sx={{ py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={item.images?.[0]} variant="rounded" />
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {item.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#2563eb" }}>
                    {Number(item.price ?? 0).toLocaleString()} EGP
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
                    />
                  </TableCell>
                  {/* ✅ Bug fix: was item.user — now item.sellerName */}
                  <TableCell>{item.sellerName ?? "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status === "sold" ? "Sold" : "Active"}
                      size="small"
                      sx={{
                        bgcolor: item.status === "sold" ? "#fef2f2" : "#ecfdf5",
                        color: item.status === "sold" ? "#dc2626" : "#10b981",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1 }}>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() => setSelectedItem(item)}
                      sx={{ 
                        color: "#2563eb", 
                        fontWeight: 700, 
                        textTransform: "none" 
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Item detail modal — includes Edit and Delete actions */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </Box>
  );
}
