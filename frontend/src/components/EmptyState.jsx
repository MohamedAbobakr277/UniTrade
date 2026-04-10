import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

export default function EmptyState({ title, description, iconType, ctaText, ctaLink, onCtaClick }) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (iconType) {
      case "shopping":
        return <ShoppingBagOutlinedIcon sx={{ fontSize: 80, color: "#94a3b8", mb: 2 }} />;
      case "favorite":
        return <FavoriteBorderOutlinedIcon sx={{ fontSize: 80, color: "#94a3b8", mb: 2 }} />;
      case "inventory":
        return <Inventory2OutlinedIcon sx={{ fontSize: 80, color: "#94a3b8", mb: 2 }} />;
      default:
        return <ShoppingBagOutlinedIcon sx={{ fontSize: 80, color: "#94a3b8", mb: 2 }} />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 12,
        px: 4,
        textAlign: "center",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: "24px",
        border: "1px dashed #cbd5e1",
      }}
    >
      {getIcon()}
      <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5 }}>
        {title}
      </Typography>
      <Typography sx={{ color: "#64748b", fontSize: "1.05rem", maxWidth: "450px", mb: 4, lineHeight: 1.6 }}>
        {description}
      </Typography>
      {ctaText && ctaLink && (
        <Button
          variant="contained"
          onClick={() => onCtaClick ? onCtaClick() : navigate(ctaLink)}
          sx={{
            bgcolor: "#2563eb",
            borderRadius: "14px",
            px: 4,
            py: 1.5,
            textTransform: "none",
            fontWeight: 800,
            fontSize: "1rem",
            boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
            "&:hover": {
              bgcolor: "#1d4ed8",
              transform: "translateY(-1px)",
            },
          }}
        >
          {ctaText}
        </Button>
      )}
    </Box>
  );
}
