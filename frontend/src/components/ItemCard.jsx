import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Avatar,
    Rating,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function ItemCard({ item }) {
  const imageUrl =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : item.image || "https://via.placeholder.com/150";

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
        transition: "0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="220"
          image={imageUrl}
          alt={item.title}
          sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        />
        {item.badge && (
          <Chip
            label={item.badge}
            sx={{
              position: "absolute",
              top: 15,
              left: 15,
              backgroundColor:
                item.badge === "Hot Deal" ? "#ef4444" : "#10b981",
              color: "white",
              fontWeight: 600,
              borderRadius: 3,
            }}
          />
        )}
      </Box>

      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {item.title}
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: "#2563eb", fontWeight: 700, mt: 1 }}
        >
          {item.price} EGP
        </Typography>

        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, color: "gray", fontSize: 14 }}
        >
          <LocationOnIcon sx={{ fontSize: 16 }} />
          <span>{item.university} - {item.condition}</span>
        </Box>

        {/* Seller section */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar src="https://i.pravatar.cc/40" sx={{ width: 36, height: 36 }} />
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Ahmed Saleh</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, backgroundColor: "#f3f4f6", px: 1.5, py: 0.5, borderRadius: 2, fontSize: 13, color: "gray" }}>
            <AccessTimeIcon sx={{ fontSize: 16 }} />
            1 hour ago
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}