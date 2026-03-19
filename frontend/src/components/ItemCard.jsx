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

  const formattedDate = item.createdAt
    ? new Date(item.createdAt.seconds * 1000).toLocaleString()
    : "Just now";

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
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        backgroundColor: item.status === "sold" ? "#f8fafc" : "#ffffff",
        boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
        transition: "all 0.3s ease",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: item.status === "sold" ? "default" : "pointer",
        opacity: item.status === "sold" ? 0.8 : 1,
        "&:hover": {
          transform: item.status === "sold" ? "none" : "translateY(-8px)",
          boxShadow: item.status === "sold" ? "none" : "0 18px 40px rgba(15,23,42,0.12)",
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
                    backgroundColor: "rgba(255,255,255,0.4)",
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
              backgroundColor: "#ffffff",
              color: conditionColor,
              fontWeight: 700,
              borderRadius: "10px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          />
        )}

        <IconButton
          onClick={toggleFavorite}
          sx={{
            position: "absolute",
            bottom: 14,
            right: 14,
            backgroundColor: "#ffffff",
            color: isFavorite ? "#ef4444" : "#94a3b8",
            "&:hover": { backgroundColor: "#f8fafc" },
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
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
            fontSize: "1.05rem",
            color: "#0f172a",
            lineHeight: 1.4,
            height: "54px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title || "Untitled Item"}
        </Typography>

        {/* Price */}
        <Typography
          variant="h6"
          sx={{
            color: "#2563eb",
            fontWeight: 800,
            mt: 1.2,
            fontSize: "1.25rem",
            height: "38px",
          }}
        >
          {item.price ? `${item.price} EGP` : "Price not available"}
        </Typography>

        {/* University */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1.2,
            height: "28px",
          }}
        >
          <LocationOnIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
          <Typography
            component="span"
            sx={{
              fontSize: "0.92rem",
              color: "#64748b",
              fontWeight: 500,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.university || "University not specified"}
          </Typography>
        </Box>

        {/* Condition */}
        <Box sx={{ mt: 1.2, height: "32px" }}>
          <Chip
            icon={<VerifiedOutlinedIcon />}
            label={item.condition || "Condition not specified"}
            size="small"
            sx={{
              backgroundColor: `${conditionColor}12`,
              color: conditionColor,
              fontWeight: 700,
              borderRadius: "10px",
              "& .MuiChip-icon": {
                color: conditionColor,
              },
            }}
          />
        </Box>

        {/* Description - always reserve height */}
        <Typography
          sx={{
            mt: 1.4,
            fontSize: "0.9rem",
            color: "#64748b",
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

        <Divider sx={{ my: 2 }} />

        {/* Footer / Seller */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 1.5,
            minHeight: "58px",
            flexWrap: "wrap",
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              minWidth: 0,
            }}
          >
            <Avatar
              src={editData?.profilePhoto || "/default-avatar.png"}
              sx={{
                width: 42,
                height: 42,
                border: "2px solid #e2e8f0",
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                }}
              >
                {sellerName}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: "#64748b",
                  mt: 0.3,
                }}
              >
                Student Seller
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              px: 1.1,
              py: 0.7,
              borderRadius: "12px",
              fontSize: 12.5,
              color: "#64748b",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
            <Typography
              component="span"
              sx={{
                fontSize: 12.5,
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              {formattedDate}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}