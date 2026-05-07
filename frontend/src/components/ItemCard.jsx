import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { IconButton } from "@mui/material";
import { createNotification } from "../services/notifications";

export default function ItemCard({ item }) {
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!item.userId) return;

      try {
        const userRef = doc(db, "users", item.userId);
        const userSnap = await getDoc(userRef);
        setEditData(userSnap.exists() ? userSnap.data() : {});
      } catch (error) {
        console.error("Error fetching seller data:", error);
        setEditData({});
      }
    };

    fetchUserData();
  }, [item.userId]);

  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let unsubUser;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const favs = docSnap.data().favourites || [];
            setIsFavorite(favs.includes(item.id));
          }
        });
      }
    });
    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
    };
  }, [item.id]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    try {
      if (isFavorite) {
        await updateDoc(userRef, { favourites: arrayRemove(item.id) });
      } else {
        await updateDoc(userRef, { favourites: arrayUnion(item.id) });
        // Notify seller about the favorite
        if (item.userId && currentUser && item.userId !== currentUser.uid) {
          const likerName = currentUser.displayName || "A user";
          createNotification(item.userId, {
            type: "favorite",
            message: `${likerName} added your item '${item.title}' to their favorites! ❤️`,
            productId: item.id,
            link: `/item/${item.id}`
          });
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const imageUrl =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : item.image || "https://via.placeholder.com/400x250?text=No+Image";

  const sellerName =
    item.sellerName || editData?.name || editData?.fullName || "Unknown Seller";

  const safeDate = item.createdAt
    ? (item.createdAt.seconds ? new Date(item.createdAt.seconds * 1000) : new Date(item.createdAt))
    : new Date();

  //  // const formattedDate = item.createdAt
  //     ? safeDate.toLocaleString()
  //     : "Just now";

  const conditionColor =
    item.condition === "New"
      ? "#16a34a"
      : item.condition === "Like New"
        ? "#2563eb"
        : "#f59e0b";

  return (
    <Card
      onClick={() => navigate(`/item/${item.id}`)}
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: item.status === "sold" ? "background.subtle" : "background.paper",
        boxShadow: (theme) => theme.palette.mode === 'light' ? "0 4px 12px rgba(15,23,42,0.03)" : "none",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: item.status === "sold" ? "default" : "pointer",
        opacity: item.status === "sold" ? 0.8 : 1,
        "&:hover": {
          transform: item.status === "sold" ? "none" : "translateY(-10px)",
          boxShadow: item.status === "sold" ? "none" : (theme) => theme.palette.mode === 'light' ? "0 22px 48px rgba(15,23,42,0.12)" : "0 22px 48px rgba(0,0,0,0.5)",
          borderColor: (theme) => theme.palette.mode === 'light' ? "#e2e8f0" : "primary.main",
        },
      }}
    >
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={item.title || "Product image"}
          sx={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            display: "block",
            transition: "transform 0.35s ease",
            ...(item.status === "sold" && {
              filter: "grayscale(100%) brightness(0.9)",
            }),
            "&:hover": {
              transform: item.status === "sold" ? "scale(1)" : "scale(1.04)",
            },
          }}
        />

        {item.status === "sold" && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: (theme) => theme.palette.mode === 'light' ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
              zIndex: 10,
            }}
          >
            <Chip
              label="SOLD OUT"
              sx={{
                fontWeight: 900,
                fontSize: "0.95rem",
                letterSpacing: "1px",
                px: 1.5,
                py: 2.5,
                borderRadius: "16px",
                backgroundColor: "#1e293b",
                color: "#ffffff",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              }}
            />
          </Box>
        )}

        {item.badge && (
          <Chip
            label={item.badge}
            size="small"
            sx={{
              position: "absolute",
              top: 14,
              left: 14,
              backgroundColor:
                item.badge === "Hot Deal" ? "#ef4444" : "#10b981",
              color: "#ffffff",
              fontWeight: 700,
              borderRadius: "10px",
              px: 0.6,
              boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
            }}
          />
        )}

        {item.condition && (
          <Chip
            label={item.condition}
            size="small"
            sx={{
              position: "absolute",
              top: 14,
              right: 14,
              backgroundColor: "background.paper",
              color: conditionColor,
              fontWeight: 700,
              borderRadius: "10px",
              boxShadow: (theme) => theme.palette.mode === 'light' ? "0 6px 18px rgba(0,0,0,0.08)" : "none",
              border: "1px solid",
              borderColor: "divider",
            }}
          />
        )}

        <IconButton
          onClick={toggleFavorite}
          sx={{
            position: "absolute",
            bottom: 14,
            right: 14,
            backgroundColor: "background.paper",
            color: isFavorite ? "#ef4444" : "text.secondary",
            "&:hover": { backgroundColor: "background.subtle" },
            boxShadow: (theme) => theme.palette.mode === 'light' ? "0 6px 18px rgba(0,0,0,0.1)" : "none",
            border: "1px solid",
            borderColor: "divider",
            zIndex: 20,
          }}
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Box>

      <CardContent
        sx={{
          p: 2.2,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "text.primary",
            lineHeight: 1.35,
            height: "58px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 0.5,
          }}
        >
          {item.title || "Untitled Item"}
        </Typography>

        {/* Price */}
        <Typography
          variant="h6"
          sx={{
            color: "#2563eb",
            fontWeight: 900,
            mt: 0.5,
            fontSize: "1.35rem",
            height: "40px",
            letterSpacing: "-0.5px",
          }}
        >
          {item.price ? `${item.price} EGP` : "Price not available"}
        </Typography>

        {/* University & Condition Meta */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5, mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
            <Typography
              sx={{
                fontSize: "0.85rem",
                color: "text.secondary",
                fontWeight: 600,
                maxWidth: "110px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.university || "University"}
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1,
              py: 0.4,
              borderRadius: "8px",
              bgcolor: `${conditionColor}12`,
              color: conditionColor,
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {item.condition || "Used"}
          </Box>
        </Box>

        {/* Description - always reserve height */}
        <Typography
          sx={{
            mt: 1.4,
            fontSize: "0.9rem",
            color: "text.secondary",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: "48px",
          }}
        >
          {item.description || "No description available"}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Footer / Seller - Large & Clean Premium Style */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2.2,
            pt: 2.2,
            pb: 1,
            borderTop: "1.5px solid",
            borderColor: "divider",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={editData?.profilePhoto || "/default-avatar.png"}
              sx={{ width: 42, height: 42, border: "2px solid", borderColor: "divider", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: { xs: "70px", sm: "110px" }
                }}
              >
                {sellerName}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500, mt: 0.2 }}>
                Student Seller
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              bgcolor: "background.subtle",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "20px",
              px: 1.5,
              py: 0.8,
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
            <Typography sx={{ fontSize: 11.5, color: "#64748b", fontWeight: 700 }}>
              {item.createdAt ? safeDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
              }) : "Just now"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}