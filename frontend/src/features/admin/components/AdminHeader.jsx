import { Box, Typography, Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { auth } from "../../../firebase";

const TAB_LABELS = {
  dashboard: "Dashboard Overview",
  listings:  "Listings Management",
  users:     "Users Management",
};

export default function AdminHeader({ activeTab }) {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAdminName(user.displayName || user.email?.split("@")[0] || "Admin");
    }
  }, []);

  const initial = adminName.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        height: 64,
        bgcolor: "white",
        borderBottom: "1px solid #e2e8f0",
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
          sx={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500, lineHeight: 1 }}
        >
          Admin Dashboard
        </Typography>
        <Typography
          sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem", lineHeight: 1.4 }}
        >
          {TAB_LABELS[activeTab] ?? ""}
        </Typography>
      </Box>

      {/* User info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", lineHeight: 1.2 }}>
            {adminName}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            Administrator
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: "#2563eb",
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
  );
}
