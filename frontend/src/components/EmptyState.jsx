import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

export default function EmptyState({ title, description, iconType, ctaText, ctaLink, onCtaClick }) {
  const navigate = useNavigate();

  const getIcon = () => {
    const iconStyle = { fontSize: 80, color: "text.secondary", mb: 2, opacity: 0.5 };
    switch (iconType) {
      case "shopping":
        return <ShoppingBagOutlinedIcon sx={iconStyle} />;
      case "favorite":
        return <FavoriteBorderOutlinedIcon sx={iconStyle} />;
      case "inventory":
        return <Inventory2OutlinedIcon sx={iconStyle} />;
      default:
        return <ShoppingBagOutlinedIcon sx={iconStyle} />;
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
        backgroundColor: (theme) => theme.palette.mode === 'light' ? "rgba(0, 0, 0, 0.02)" : "rgba(255, 255, 255, 0.02)",
        borderRadius: "32px",
        border: "2px dashed",
        borderColor: "divider",
        width: '100%'
      }}
    >
      {getIcon()}
      <Typography variant="h5" sx={{ fontWeight: 900, color: "text.primary", mb: 1.5, letterSpacing: '-0.5px' }}>
        {title}
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: "1.05rem", maxWidth: "450px", mb: 4, lineHeight: 1.6, fontWeight: 500 }}>
        {description}
      </Typography>
      {ctaText && ctaLink && (
        <Button
          variant="contained"
          onClick={() => onCtaClick ? onCtaClick() : navigate(ctaLink)}
          sx={{
            background: (theme) => theme.palette.mode === 'light' 
                ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                : "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
            borderRadius: "14px",
            px: 4,
            py: 1.5,
            textTransform: "none",
            fontWeight: 800,
            fontSize: "1rem",
            boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 12px 25px rgba(37, 99, 235, 0.3)",
            },
          }}
        >
          {ctaText}
        </Button>
      )}
    </Box>
  );
}
