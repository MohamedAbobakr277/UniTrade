import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  useTheme,
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

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "Books & Notes",
  price: "",
  condition: "New",
};

export default function AddListingModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const theme = useTheme();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => {
    onSave(form);
    setForm(EMPTY_FORM);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4, p: 1, bgcolor: "background.paper", backgroundImage: "none" } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>Add New Listing</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
        <TextField
          fullWidth
          label="Item Name"
          name="title"
          value={form.title}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            fullWidth
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
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
          />
        </Box>
        <TextField
          select
          fullWidth
          label="Condition"
          name="condition"
          value={form.condition}
          onChange={handleChange}
        >
          {CONDITIONS.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ bgcolor: "primary.main", fontWeight: 700 }}
        >
          Post Listing
        </Button>
      </DialogActions>
    </Dialog>
  );
}
