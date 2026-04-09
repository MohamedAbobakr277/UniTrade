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
import DashboardIcon   from "@mui/icons-material/Dashboard";
import ListAltIcon     from "@mui/icons-material/ListAlt";
import PeopleIcon      from "@mui/icons-material/People";
import LogoutIcon      from "@mui/icons-material/Logout";
import ChevronLeftIcon  from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import logo from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../services/auth";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", Icon: DashboardIcon },
  { key: "listings",  label: "Listings",  Icon: ListAltIcon },
  { key: "users",     label: "Users",     Icon: PeopleIcon },
];

const FULL_WIDTH      = 240;
const COLLAPSED_WIDTH = 72;

export default function AdminSidebar({ activeTab, onTabChange, collapsed, onToggleCollapse }) {
  const navigate = useNavigate();

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
  const NavBtn = ({ label, isActive, Icon, onClick }) => {
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
            bgcolor: "#eff6ff",
            "&:hover": { bgcolor: "#dbeafe" },
          },
          "&:hover": { bgcolor: "#f8fafc" },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : 36,
            color: isActive ? "#2563eb" : "#64748b",
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
              color: isActive ? "#2563eb" : "#0f172a",
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
  const ActionBtn = ({ label, Icon, onClick, color = "#64748b", hoverBg = "#f8fafc" }) => {
    const btn = (
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2,
          minHeight: 44,
          px: collapsed ? 1.5 : 2,
          justifyContent: collapsed ? "center" : "flex-start",
          color,
          "&:hover": { bgcolor: hoverBg },
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
        bgcolor: "white",
        borderRight: "1px solid #e2e8f0",
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
          borderBottom: "1px solid #e2e8f0",
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
              color: "#0f172a",
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
          borderTop: "1px solid #e2e8f0",
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
          color="#ef4444"
          hoverBg="#fef2f2"
        />
      </Box>
    </Box>
  );
}
