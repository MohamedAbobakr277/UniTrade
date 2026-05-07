import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import logo from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../services/auth";
import { useTheme } from "@mui/material/styles";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", Icon: DashboardIcon },
  { key: "listings", label: "Listings", Icon: ListAltIcon },
  { key: "users", label: "Users", Icon: PeopleIcon },
];

const FULL_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

export default function AdminSidebar({ activeTab, onTabChange, collapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { state: { successMessage: "You have successfully logged out." } });
    } catch (err) {
      console.error("Error logging out:", err.message);
    }
  };

  const width = collapsed ? COLLAPSED_WIDTH : FULL_WIDTH;

  /* ── helper: nav button ── */
  const NavBtn = ({ label, isActive, onClick }) => {
    const btn = (
      <ListItemButton
        selected={isActive}
        onClick={onClick}
        sx={{
          borderRadius: 2,
          minHeight: 44,
          px: collapsed ? 1.5 : 2,
          justifyContent: collapsed ? "center" : "flex-start",
          "&.Mui-selected": {
            bgcolor: isDark ? "rgba(37, 99, 235, 0.12)" : "#eff6ff",
            "&:hover": { bgcolor: isDark ? "rgba(37, 99, 235, 0.18)" : "#dbeafe" },
          },
          "&:hover": { bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f8fafc" },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : 36,
            color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
          }}
        >
          <Icon fontSize="small" />
        </ListItemIcon>

        {!collapsed && (
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontWeight: isActive ? 700 : 500,
              fontSize: "0.9rem",
              color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
            }}
          />
        )}
      </ListItemButton>
    );

    return collapsed ? (
      <Tooltip title={label} placement="right">{btn}</Tooltip>
    ) : btn;
  };

  /* ── helper: bottom action button ── */
  const ActionBtn = ({ label, onClick, color, hoverBg }) => {
    const defaultColor = theme.palette.text.secondary;
    const btnColor = color || defaultColor;
    const btnHoverBg = hoverBg || (isDark ? "rgba(255, 255, 255, 0.05)" : "#f8fafc");
    const btn = (
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2,
          minHeight: 44,
          px: collapsed ? 1.5 : 2,
          justifyContent: collapsed ? "center" : "flex-start",
          color: btnColor,
          "&:hover": { bgcolor: btnHoverBg },
        }}
      >
        <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: "inherit" }}>
          <Icon fontSize="small" />
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={label}
            primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9rem", color }}
          />
        )}
      </ListItemButton>
    );

    return collapsed ? (
      <Tooltip title={label} placement="right">{btn}</Tooltip>
    ) : btn;
  };

  return (
    <Box
      sx={{
        width,
        minHeight: "100vh",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── Logo ── */}
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          px: collapsed ? 1.5 : 3,
          gap: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img src={logo} alt="UniTrade" style={{ height: 36, flexShrink: 0 }} />
        {!collapsed && (
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "text.primary",
              whiteSpace: "nowrap",
              letterSpacing: "-0.02em",
            }}
          >
            UniTrade
          </Typography>
        )}
      </Box>

      {/* ── Nav items ── */}
      <Box sx={{ flex: 1, py: 2, px: collapsed ? 1 : 1.5 }}>
        <List sx={{ display: "flex", flexDirection: "column", gap: 0.5, p: 0 }}>
          {NAV_ITEMS.map(({ key, label, Icon }) => (
            <ListItem key={key} disablePadding>
              <NavBtn
                label={label}
                isActive={activeTab === key}
                Icon={Icon}
                onClick={() => onTabChange(key)}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* ── Bottom: Collapse + Logout ── */}
      <Box
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          py: 1.5,
          px: collapsed ? 1 : 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <ActionBtn
          label={collapsed ? "Expand" : "Collapse"}
          Icon={collapsed ? ChevronRightIcon : ChevronLeftIcon}
          onClick={onToggleCollapse}
        />
        <ActionBtn
          label="Logout"
          Icon={LogoutIcon}
          onClick={handleLogout}
          color={theme.palette.error.main}
          hoverBg={isDark ? "rgba(239, 68, 68, 0.1)" : "#fef2f2"}
        />
      </Box>
    </Box>
  );
}
