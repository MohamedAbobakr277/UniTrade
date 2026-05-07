import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Button,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SchoolIcon from "@mui/icons-material/School";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useState } from "react";

const STATUS_CHIP = (isDark) => ({
  available: {
    label: "Available",
    bgcolor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5",
    color: isDark ? "#34d399" : "#10b981"
  },
  sold: {
    label: "Sold",
    bgcolor: isDark ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
    color: isDark ? "#f87171" : "#ef4444"
  },
});

const CONDITION_COLOR = {
  "New": "#10b981",
  "Like New": "#2563eb",
  "Good": "#f59e0b",
  "Fair": "#f97316",
  "Poor": "#ef4444",
};

export default function ItemDetailModal({ item, onClose, onDelete }) {
  const [imgIdx, setImgIdx] = useState(0);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!item) return null;

  const images = item.images ?? (item.imageUrls ?? []);
  const chips = STATUS_CHIP(isDark);
  const chip = chips[item.status] ?? chips.available;
  const date = item.createdAt?.seconds
    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("en-EG", {
      year: "numeric", month: "short", day: "numeric",
    })
    : "—";
  const condColor = CONDITION_COLOR[item.condition] ?? "#64748b";

  return (
    <Dialog
      open={!!item}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "6px",
          overflow: "hidden",
          fontFamily: "'Outfit', sans-serif",
          bgcolor: "background.paper",
          backgroundImage: "none",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>

        {/* ── Image gallery ── */}
        <Box sx={{ position: "relative", bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9" }}>
          {images.length > 0 ? (
            <Box
              component="img"
              src={images[imgIdx]}
              alt={item.title}
              sx={{
                width: "100%",
                height: 280,
                objectFit: "contain",
                display: "block",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc",
              }}
            />
          ) : (
            <Box
              sx={{
                height: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
                fontSize: "0.9rem",
              }}
            >
              No image available
            </Box>
          )}

          {/* Close button */}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
              color: isDark ? "white" : "inherit",
              "&:hover": { bgcolor: isDark ? "rgba(0,0,0,0.7)" : "white" },
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                px: 2,
                pb: 1.5,
                pt: 1,
                overflowX: "auto",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              {images.map((url, i) => (
                <Box
                  key={i}
                  component="img"
                  src={url}
                  onClick={() => setImgIdx(i)}
                  sx={{
                    width: 52,
                    height: 52,
                    objectFit: "cover",
                    borderRadius: 2,
                    cursor: "pointer",
                    flexShrink: 0,
                    border: i === imgIdx
                      ? `2px solid ${theme.palette.primary.main}`
                      : "2px solid transparent",
                    opacity: i === imgIdx ? 1 : 0.6,
                    transition: "all 0.15s",
                    "&:hover": { opacity: 1 },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* ── Details ── */}
        <Box sx={{ p: 3 }}>
          {/* Title + status */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.2rem",
                color: "text.primary",
                flex: 1,
                mr: 2,
                letterSpacing: "-0.01em",
              }}
            >
              {item.title}
            </Typography>
            <Chip
              label={chip.label}
              size="small"
              sx={{ bgcolor: chip.bgcolor, color: chip.color, fontWeight: 700, fontSize: "0.75rem", height: 26 }}
            />
          </Box>

          {/* Price */}
          <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, color: "primary.main", mb: 2.5 }}>
            {Number(item.price ?? 0).toLocaleString()} EGP
          </Typography>

          {/* Info pills row */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
            {item.category && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "background.subtle", borderRadius: 2, px: 1.5, py: 0.5 }}>
                <CategoryIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.secondary" }}>
                  {item.category}
                </Typography>
              </Box>
            )}
            {item.condition && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "background.subtle", borderRadius: 2, px: 1.5, py: 0.5 }}>
                <LocalOfferIcon sx={{ fontSize: 14, color: condColor }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: condColor }}>
                  {item.condition}
                </Typography>
              </Box>
            )}
            {item.university && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "background.subtle", borderRadius: 2, px: 1.5, py: 0.5 }}>
                <SchoolIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.secondary" }}>
                  {item.university}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "background.subtle", borderRadius: 2, px: 1.5, py: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.secondary" }}>
                {date}
              </Typography>
            </Box>
            {item.quantityAvailable !== undefined && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "background.subtle", borderRadius: 2, px: 1.5, py: 0.5 }}>
                <InventoryIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.secondary" }}>
                  Stock: {item.quantityAvailable}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Description */}
          {item.description && (
            <>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.8, opacity: 0.7 }}>
                Description
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "text.primary", lineHeight: 1.7, mb: 2.5 }}>
                {item.description}
              </Typography>
            </>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Seller info */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                src={item.sellerPhoto}
                sx={{ width: 38, height: 38, bgcolor: "primary.main", fontSize: "0.9rem", fontWeight: 700 }}
              >
                {item.sellerName?.charAt(0)?.toUpperCase() ?? "?"}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary" }}>
                  {item.sellerName ?? "Unknown Seller"}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Seller</Typography>
              </Box>
            </Box>

            {/* WhatsApp button if number exists */}
            {item.whatsappNumber && (
              <Box
                component="a"
                href={`https://wa.me/${item.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  bgcolor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5",
                  color: isDark ? "#34d399" : "#10b981",
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 2,
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  "&:hover": { bgcolor: isDark ? "rgba(16, 185, 129, 0.25)" : "#dcfce7" },
                  transition: "background 0.15s",
                }}
              >
                <WhatsAppIcon fontSize="small" />
                Contact
              </Box>
            )}
          </Box>

          {/* ── Action buttons (only shown in Listings management, not dashboard) ── */}
          {onDelete && (
            <>
              <Divider sx={{ mt: 2.5, mb: 2 }} />
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => { onDelete(item); onClose(); }}
                fullWidth
                sx={{
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Delete Listing (Moderation)
              </Button>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
