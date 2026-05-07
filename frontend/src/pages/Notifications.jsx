import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Button, 
  Divider, 
  useTheme, 
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { 
  subscribeToNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification
} from "../services/notifications";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Notifications() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    let unsubNotifs;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubNotifs = subscribeToNotifications(user.uid, (notifs) => {
          setNotifications(notifs);
        });
      } else {
        setNotifications([]);
        if (unsubNotifs) unsubNotifs();
      }
    });

    return () => {
      unsubAuth();
      if (unsubNotifs) unsubNotifs();
    };
  }, []);

  const handleMarkAsRead = async (notif) => {
    if (!notif.read && auth.currentUser) {
      await markNotificationAsRead(auth.currentUser.uid, notif.id);
    }
    const link = notif.link || (notif.productId ? `/item/${notif.productId}` : null);
    if (link) {
      // Ensure the link is absolute and trimmed
      const targetLink = link.startsWith('/') ? link.trim() : `/${link.trim()}`;
      navigate(targetLink);
    }
  };

  const handleMarkAllRead = async () => {
    if (auth.currentUser) {
      await markAllNotificationsAsRead(auth.currentUser.uid);
    }
  };

  const handleMenuOpen = (event, notif) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedNotif(notif);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedNotif(null);
  };

  const handleDelete = async () => {
    if (auth.currentUser && selectedNotif) {
      await deleteNotification(auth.currentUser.uid, selectedNotif.id);
      handleMenuClose();
    }
  };

  const handleToggleRead = async () => {
    if (auth.currentUser && selectedNotif) {
      const notifRef = doc(db, "users", auth.currentUser.uid, "notifications", selectedNotif.id);
      await updateDoc(notifRef, { read: !selectedNotif.read });
      handleMenuClose();
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch = n.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || !n.read;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: isDark
          ? "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)"
          : "linear-gradient(180deg, #f8fbff 0%, #f5f7fb 35%, #eef4ff 100%)",
      }}
    >
      <Navbar />

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, flex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ 
              mb: 3, 
              color: "text.secondary", 
              textTransform: "none", 
              fontWeight: 700,
              "&:hover": { color: "primary.main", bgcolor: "transparent" }
            }}
          >
            Back
          </Button>
          
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", letterSpacing: "-0.04em", mb: 1 }}>
                All Notifications
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "1.1rem", fontWeight: 500 }}>
                Review all your campus updates and activity in one place.
              </Typography>
            </Box>
            
            {unreadCount > 0 && (
              <Button
                variant="contained"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllRead}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 800,
                  px: 3,
                  py: 1.2,
                  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
                  "&:hover": { boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)" }
                }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
        </Box>

        {/* Controls */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: "20px",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            bgcolor: "background.paper",
            boxShadow: isDark ? "none" : "0 8px 30px rgba(15, 23, 42, 0.04)"
          }}
        >
          <TextField
            fullWidth
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)",
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery("")} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip 
              label="All" 
              onClick={() => setFilter("all")}
              sx={{ 
                fontWeight: 700, 
                px: 1,
                bgcolor: filter === "all" ? "primary.main" : "transparent",
                color: filter === "all" ? "#fff" : "text.secondary",
                border: "1px solid",
                borderColor: filter === "all" ? "primary.main" : "divider",
                "&:hover": { bgcolor: filter === "all" ? "primary.dark" : "background.subtle" }
              }} 
            />
            <Chip 
              label={`Unread (${unreadCount})`} 
              onClick={() => setFilter("unread")}
              sx={{ 
                fontWeight: 700, 
                px: 1,
                bgcolor: filter === "unread" ? "primary.main" : "transparent",
                color: filter === "unread" ? "#fff" : "text.secondary",
                border: "1px solid",
                borderColor: filter === "unread" ? "primary.main" : "divider",
                "&:hover": { bgcolor: filter === "unread" ? "primary.dark" : "background.subtle" }
              }} 
            />
          </Box>
        </Paper>

        {/* List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <Paper
                key={notif.id}
                onClick={() => handleMarkAsRead(notif)}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: notif.read ? "divider" : "primary.main",
                  bgcolor: notif.read ? "background.paper" : (isDark ? "rgba(37,99,235,0.05)" : "#f0f7ff"),
                  cursor: "pointer",
                  display: "flex",
                  gap: { xs: 2, sm: 3 },
                  alignItems: "center",
                  transition: "all 0.2s",
                  "&:hover": { 
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                    borderColor: "primary.main"
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: notif.read ? "background.subtle" : "primary.main",
                    width: 48,
                    height: 48,
                    color: notif.read ? "text.secondary" : "#fff",
                    display: { xs: "none", sm: "flex" }
                  }}
                >
                  <NotificationsNoneIcon />
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ 
                    fontSize: "1.05rem", 
                    fontWeight: notif.read ? 600 : 800, 
                    color: "text.primary",
                    mb: 0.5,
                    lineHeight: 1.4
                  }}>
                    {notif.message}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", fontWeight: 500, display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                      {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : "Just now"}
                    </Typography>
                    {!notif.read && (
                      <Chip 
                        label="New" 
                        size="small" 
                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800, bgcolor: "primary.main", color: "#fff" }} 
                      />
                    )}
                  </Box>
                </Box>
                
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, notif)}
                  sx={{ color: "text.secondary", opacity: 0.5, "&:hover": { opacity: 1, bgcolor: "background.subtle" } }}
                >
                  <FilterListIcon sx={{ transform: "rotate(90deg)" }} />
                </IconButton>
              </Paper>
            ))
          ) : (
            <Box 
              sx={{ 
                py: 12, 
                textAlign: "center", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: 3 
              }}
            >
              <Box 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: "50%", 
                  bgcolor: "background.paper", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.04)"
                }}
              >
                <NotificationsNoneIcon sx={{ fontSize: 60, color: "primary.main", opacity: 0.2 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}>
                  You're all caught up
                </Typography>
                <Typography sx={{ color: "text.secondary", fontWeight: 500 }}>
                  There are no notifications matching your search right now.
                </Typography>
              </Box>
              <Button 
                variant="outlined"
                onClick={() => { setSearchQuery(""); setFilter("all"); }}
                sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700 }}
              >
                Clear all filters
              </Button>
            </Box>
          )}
        </Box>
      </Container>

      {/* Options Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "14px",
            minWidth: 180,
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            backgroundImage: "none",
          }
        }}
      >
        <MenuItem onClick={handleToggleRead} sx={{ py: 1.5 }}>
          <ListItemIcon>
            {selectedNotif?.read ? <MarkEmailUnreadIcon fontSize="small" /> : <MarkEmailReadIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText 
            primary={selectedNotif?.read ? "Mark as unread" : "Mark as read"} 
            primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 600 }}
          />
        </MenuItem>
        
        <Divider sx={{ my: 0.5 }} />
        
        <MenuItem onClick={handleDelete} sx={{ py: 1.5, color: "error.main" }}>
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Delete notification" 
            primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 600 }}
          />
        </MenuItem>
      </Menu>

      <Footer />
    </Box>
  );
}
