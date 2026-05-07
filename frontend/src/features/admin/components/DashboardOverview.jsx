import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PeopleIcon from "@mui/icons-material/People";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useState } from "react";
import ItemDetailModal from "./ItemDetailModal";

/* ── colours ── */
const CAT_COLORS = [
  "#2563eb", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ef4444", "#ec4899", "#64748b",
];
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

/* ─────────────────────────────────────────
   Stat card  (label top-left, icon top-right, big number below)
───────────────────────────────────────── */
function StatCard({ label, value, iconBg, iconColor }) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 0,
        p: "22px 24px",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Typography sx={{ fontSize: "0.83rem", fontWeight: 600, color: "text.secondary" }}>
          {label}
        </Typography>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
          }}
        >
          <Icon />
        </Box>
      </Box>
      <Typography sx={{ fontSize: "2.4rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
        {value}
      </Typography>
    </Paper>
  );
}

/* ─────────────────────────────────────────
   Breakdown row
───────────────────────────────────────── */
function BreakdownRow({ label, count, color }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
        <Typography sx={{ fontSize: "0.88rem", color: "text.secondary", fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "text.primary" }}>
        {count}
      </Typography>
    </Box>
  );
}

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
export default function DashboardOverview({ listings, users, onViewAll }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  // const chips = STATUS_CHIP(isDark);

  const available = listings.filter((l) => l.status !== "sold").length;
  const sold = listings.filter((l) => l.status === "sold").length;

  const recentListings = [...listings]
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    .slice(0, 6);

  const categoryMap = {};
  listings.forEach((l) => {
    const cat = l.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryBreakdown = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  const stats = [
    { label: "Total Listings", value: listings.length, Icon: ListAltIcon, iconBg: isDark ? "rgba(37, 99, 235, 0.15)" : "#eff6ff", iconColor: "#2563eb" },
    { label: "Available", value: available, Icon: CheckCircleOutlineIcon, iconBg: isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5", iconColor: "#10b981" },
    { label: "Sold", value: sold, Icon: LocalOfferIcon, iconBg: isDark ? "rgba(245, 158, 11, 0.15)" : "#fffbeb", iconColor: "#f59e0b" },
    { label: "Avg User Rating", value: users.length > 0 ? (users.reduce((acc, u) => acc + (u.averageRating || 0), 0) / users.length).toFixed(1) : "0.0", Icon: PeopleIcon, iconBg: isDark ? "rgba(139, 92, 246, 0.15)" : "#f5f3ff", iconColor: "#8b5cf6" },
  ];

  return (
    <Box sx={{ animation: "fadeIn 0.4s ease", display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>

      {/* Page title */}
      <Box>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "text.primary", letterSpacing: "-0.02em" }}>
          Dashboard Overview
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", mt: 0.4 }}>
          Monitor and manage all campus trade activities.
        </Typography>
      </Box>

      {/* ── 4 Stat cards — flex row, each stretches equally ── */}
      <Box sx={{ display: "flex", gap: 2.5 }}>
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </Box>

      {/* ── Two-column body ── */}
      <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start", flex: 1, flexWrap: { xs: "wrap", lg: "nowrap" } }}>

        {/* Left: Recent listings */}
        <Paper
          elevation={0}
          sx={{
            flex: "2 1 0",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          {/* Panel header */}
          <Box
            sx={{
              px: 3,
              py: 2.2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem" }}>
                Recent Listings
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.2 }}>
                Latest posted student items
              </Typography>
            </Box>
            <Button
              endIcon={<ArrowForwardIcon fontSize="small" />}
              onClick={onViewAll}
              size="small"
              sx={{ textTransform: "none", fontWeight: 700, color: "#2563eb", fontSize: "0.85rem" }}
            >
              View All
            </Button>
          </Box>

          {/* Rows */}
          {recentListings.length === 0 ? (
            <Typography sx={{ p: 4, color: "text.secondary", textAlign: "center" }}>
              No listings yet.
            </Typography>
          ) : (
            recentListings.map((item, idx) => {
              const chips = STATUS_CHIP(isDark);
              const chip = chips[item.status] ?? chips.available;
              return (
                <Box key={item.id}>
                  <Box
                    sx={{
                      px: 3,
                      py: 1.6,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "background.subtle" },
                    }}
                  >
                    {/* Thumbnail */}
                    <Avatar
                      src={item.images?.[0]}
                      variant="rounded"
                      sx={{ width: 44, height: 44, flexShrink: 0, bgcolor: "background.subtle" }}
                    />

                    {/* Title + seller */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.93rem",
                          color: "text.primary",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.25 }}>
                        {item.sellerName ?? "—"}
                      </Typography>
                    </Box>

                    {/* Price */}
                    <Typography
                      sx={{ fontWeight: 700, fontSize: "0.93rem", color: "#2563eb", whiteSpace: "nowrap" }}
                    >
                      {Number(item.price ?? 0).toLocaleString()} EGP
                    </Typography>

                    {/* Status chip */}
                    <Chip
                      label={chip.label}
                      size="small"
                      sx={{ bgcolor: chip.bgcolor, color: chip.color, fontWeight: 700, fontSize: "0.72rem", height: 26, minWidth: 72 }}
                    />

                    {/* View icon */}
                    <Box
                      onClick={() => setSelectedItem(item)}
                      sx={{
                        color: "text.secondary",
                        display: "flex",
                        cursor: "pointer",
                        "&:hover": { color: "primary.main" },
                        transition: "color 0.15s",
                      }}
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </Box>
                  </Box>

                  {idx < recentListings.length - 1 && <Divider sx={{ mx: 3 }} />}
                </Box>
              );
            })
          )}
        </Paper>

        {/* Right panel */}
        <Box sx={{ flex: "1 1 0", display: "flex", flexDirection: "column", gap: 2.5, minWidth: 220 }}>

          {/* Status Breakdown */}
          <Paper
            elevation={0}
            sx={{ p: "20px 24px", borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
          >
            <Typography sx={{ fontWeight: 700, color: "text.primary", mb: 2, fontSize: "1rem" }}>
              Status Breakdown
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <BreakdownRow label="Available" count={available} color="#10b981" />
              <BreakdownRow label="Sold" count={sold} color="#ef4444" />
            </Box>
          </Paper>

          {/* Category Breakdown */}
          <Paper
            elevation={0}
            sx={{ p: "20px 24px", borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
          >
            <Typography sx={{ fontWeight: 700, color: "text.primary", mb: 2, fontSize: "1rem" }}>
              Category Breakdown (Item Count)
            </Typography>
            {categoryBreakdown.length === 0 ? (
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>No data yet.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {categoryBreakdown.map(([cat, count], idx) => (
                  <BreakdownRow
                    key={cat}
                    label={cat}
                    count={count}
                    color={CAT_COLORS[idx % CAT_COLORS.length]}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* ── Item detail modal ── */}
      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </Box>
  );
}
