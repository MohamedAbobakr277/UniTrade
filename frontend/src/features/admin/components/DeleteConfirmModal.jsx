import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function DeleteConfirmModal({ item, onClose, onConfirm }) {
  if (!item) return null;

  const statusChip = item.status === "sold"
    ? { label: "Sold",      bgcolor: "#fef2f2", color: "#ef4444" }
    : { label: "Available", bgcolor: "#ecfdf5", color: "#10b981" };

  return (
    <Dialog
      open={!!item}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
    >
      <DialogContent sx={{ p: 0 }}>

        {/* Red warning header */}
        <Box
          sx={{
            bgcolor: "#fef2f2",
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: "1px solid #fecaca",
          }}
        >
          <WarningAmberRoundedIcon sx={{ color: "#ef4444", fontSize: 26 }} />
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#b91c1c", fontSize: "1rem" }}>
              Delete Listing
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#ef4444" }}>
              This action cannot be undone
            </Typography>
          </Box>
        </Box>

        {/* Item preview */}
        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
              mb: 2.5,
            }}
          >
            <Avatar
              src={item.images?.[0]}
              variant="rounded"
              sx={{ width: 52, height: 52, bgcolor: "#e2e8f0", flexShrink: 0 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  color: "#0f172a",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.title}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#64748b", mt: 0.25 }}>
                {item.sellerName ?? "Unknown Seller"} · {item.category ?? "—"}
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#2563eb", mt: 0.5 }}>
                {Number(item.price ?? 0).toLocaleString()} EGP
              </Typography>
            </Box>
            <Chip
              label={statusChip.label}
              size="small"
              sx={{
                bgcolor: statusChip.bgcolor,
                color:   statusChip.color,
                fontWeight: 700,
                fontSize: "0.7rem",
                flexShrink: 0,
              }}
            />
          </Box>

          <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.6 }}>
            Are you sure you want to permanently delete{" "}
            <strong style={{ color: "#0f172a" }}>{item.title}</strong>?
            All images and data will be removed from the platform.
          </Typography>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ fontWeight: 600, color: "#64748b", textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2, px: 3 }}
        >
          Yes, Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
