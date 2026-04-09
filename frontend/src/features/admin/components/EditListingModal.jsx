import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Avatar,
  Typography,
  Divider,
  Chip,
} from "@mui/material";

const CATEGORIES = [
  "Books & Notes",
  "Calculators",
  "Electronics",
  "Engineering Tools",
  "Medical Tools",
  "Lab Equipment",
  "Stationery",
  "Bags & Accessories",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

const STATUSES = [
  { value: "available", label: "Available" },
  { value: "sold",      label: "Sold" },
];

export default function EditListingModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    title:       "",
    description: "",
    category:    "",
    price:       "",
    condition:   "",
    status:      "available",
  });

  useEffect(() => {
    if (item) {
      setForm({
        title:       item.title       ?? "",
        description: item.description ?? "",
        category:    item.category    ?? "",
        price:       item.price       ?? "",
        condition:   item.condition   ?? "",
        status:      item.status      ?? "available",
      });
    }
  }, [item]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <Dialog
      open={!!item}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
    >
      {/* Header with item preview */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 3,
          py: 2.5,
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Avatar
          src={item?.images?.[0]}
          variant="rounded"
          sx={{ width: 48, height: 48, bgcolor: "#e2e8f0" }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#0f172a",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item?.title ?? "Edit Listing"}
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8" }}>
            Seller: {item?.sellerName ?? "—"}
          </Typography>
        </Box>
        <Chip
          label={form.status === "sold" ? "Sold" : "Available"}
          size="small"
          sx={{
            bgcolor: form.status === "sold" ? "#fef2f2" : "#ecfdf5",
            color:   form.status === "sold" ? "#ef4444" : "#10b981",
            fontWeight: 700,
            fontSize: "0.72rem",
          }}
        />
      </Box>

      <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>Edit Listing</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2.5 }}>

        {/* Title */}
        <TextField
          fullWidth
          label="Item Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          size="small"
        />

        {/* Description */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          size="small"
        />

        {/* Category + Price */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            fullWidth
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            size="small"
          >
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Price (EGP)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            size="small"
          />
        </Box>

        {/* Condition + Status */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            fullWidth
            label="Condition"
            name="condition"
            value={form.condition}
            onChange={handleChange}
            size="small"
          >
            {CONDITIONS.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>

          {/* ── Admin-only: change listing status ── */}
          <TextField
            select
            fullWidth
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            size="small"
            SelectProps={{
              renderValue: (val) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: val === "sold" ? "#ef4444" : "#10b981",
                    }}
                  />
                  {val === "sold" ? "Sold" : "Available"}
                </Box>
              ),
            }}
          >
            {STATUSES.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: value === "sold" ? "#ef4444" : "#10b981",
                    }}
                  />
                  {label}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ fontWeight: 600, color: "#64748b" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave(form)}
          sx={{ bgcolor: "#2563eb", fontWeight: 700, textTransform: "none", borderRadius: 2, px: 3 }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
