import { Box, Typography, Avatar, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useColorMode } from "../../../context/ThemeContext";

const TAB_LABELS = {
  dashboard: "Dashboard Overview",
  listings:  "Listings Management",
  users:     "Users Management",
};

export default function AdminHeader({ activeTab }) {
  const [adminName, setAdminName] = useState("Admin");
  const theme = useTheme();
  const colorMode = useColorMode();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const fetchAdminName = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
          setAdminName(fullName || data.name || user.email?.split("@")[0] || "Admin");
        }
      } catch (err) {
        console.error("Error fetching admin name:", err);
      }
    };

    fetchAdminName();
  }, []);

  const initial = adminName.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        height: 64,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        px: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <Box>
        <Typography
          sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 500, lineHeight: 1 }}
        >
          Admin Dashboard
        </Typography>
        <Typography
          sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem", lineHeight: 1.4 }}
        >
          {TAB_LABELS[activeTab] ?? ""}
        </Typography>
      </Box>

      {/* Controls & User info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <IconButton 
            onClick={colorMode.toggleColorMode} 
            sx={{ 
              bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
              "&:hover": { bgcolor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)" }
            }}
          >
            {isDark ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "text.primary", lineHeight: 1.2 }}>
              {adminName}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
              Administrator
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 36,
              height: 36,
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {initial}
          </Avatar>
        </Box>
      </Box>
    </Box>
  );
}
