import {
    Box,
    Typography,
    Button,
    IconButton,
    Avatar,
    Paper,
    InputBase,
    Badge,
    Divider,
    useTheme,
    Tooltip,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NorthWestIcon from "@mui/icons-material/NorthWest";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { subscribeToNotifications, markNotificationAsRead } from "../services/notifications";
import Popover from "@mui/material/Popover";
import { useColorMode } from "../context/ThemeContext";

const RECENT_KEY = "unitrade_recent_searches";
const MAX_RECENT = 6;
const TRENDING = ["Books", "Calculator", "Laptop", "Lab Coat", "Engineering Tools", "Stationery"];

function saveRecent(term) {
    if (!term.trim()) return;
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const updated = [term, ...stored.filter((s) => s !== term)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

function getRecent() {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
}

function removeRecent(term) {
    const updated = getRecent().filter((s) => s !== term);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

// Highlight matching part of text
function HighlightMatch({ text, query }) {
    if (!query.trim()) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <strong style={{ color: "#2563eb" }}>{text.slice(idx, idx + query.length)}</strong>
            {text.slice(idx + query.length)}
        </span>
    );
}

export default function Navbar({ search = "", setSearch, items = [], onSearch }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === "/home";
    const [editData, setEditData] = useState(null);
    const [open, setOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [inputValue, setInputValue] = useState(search);
    const [notifications, setNotifications] = useState([]);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const { toggleColorMode } = useColorMode();
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;
    const isNotifOpen = Boolean(notifAnchorEl);
    
    const handleNotifClick = (event) => {
        setNotifAnchorEl(event.currentTarget);
    };
    
    const handleNotifClose = () => {
        setNotifAnchorEl(null);
    };

    const handleNotifItemClick = async (notif) => {
        if (!notif.read && auth.currentUser) {
            await markNotificationAsRead(auth.currentUser.uid, notif.id);
        }
        setNotifAnchorEl(null);
        if (notif.link) {
            navigate(notif.link);
        }
    };

    // Sync inputValue when Home updates the search from outside (e.g. clear)
    useEffect(() => {
        if (isHome) setInputValue(search);
    }, [search, isHome]);

    useEffect(() => {
        let unsubNotifs;
        const fetchUserData = async (user) => {
            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                setEditData(userSnap.exists() ? userSnap.data() : {});
            } catch (error) {
                setEditData({});
            }
        };

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserData(user);
                unsubNotifs = subscribeToNotifications(user.uid, (notifs) => {
                    setNotifications(notifs);
                });
            } else {
                setEditData({});
                setNotifications([]);
                if (unsubNotifs) unsubNotifs();
            }
        });

        return () => {
            unsubAuth();
            if (unsubNotifs) unsubNotifs();
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    // Close dropdown whenever the route changes (e.g. user clicks an item card)
    useEffect(() => {
        setOpen(false);
        setActiveIndex(-1);
    }, [location.pathname]);

    const handleLogoClick = () => {
        if (location.pathname === "/home") window.scrollTo({ top: 0, behavior: "smooth" });
        else navigate("/home");
    };

    const handleFocus = () => {
        setRecentSearches(getRecent());
        setActiveIndex(-1);
        setOpen(true);
    };

    const handleSelect = (term) => {
        setInputValue(term);
        saveRecent(term);
        if (isHome || onSearch) {
            setSearch?.(term);
            onSearch?.(term);
        } else {
            navigate("/home", { state: { q: term } });
        }
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
    };

    const handleSubmit = () => {
        const term = activeIndex >= 0 && suggestions[activeIndex]
            ? suggestions[activeIndex].title
            : inputValue.trim();
        setInputValue(term);
        if (term) saveRecent(term);
        if (isHome || onSearch) {
            setSearch?.(term);
            onSearch?.(term);
        } else {
            navigate("/home", { state: { q: term } });
        }
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
    };

    const handleRemoveRecent = (e, term) => {
        e.stopPropagation();
        removeRecent(term);
        setRecentSearches(getRecent());
    };

    const handleClear = () => {
        setInputValue("");
        if (isHome || onSearch) {
            setSearch?.("");
            onSearch?.("");
        }
        setRecentSearches(getRecent());
        setActiveIndex(-1);
        setOpen(true);
        inputRef.current?.focus();
    };

    // Suggestions built from local inputValue (works on any page)
    const suggestions = inputValue.trim().length >= 1
        ? [...new Map(
            items
                .filter((item) =>
                    item.title?.toLowerCase().includes(inputValue.toLowerCase()) ||
                    item.category?.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((item) => [item.title?.toLowerCase(), item])
          ).values()]
          .slice(0, 7)
        : [];

    const hasItemsSource = items && items.length > 0;
    const showEmpty = open && !inputValue.trim();
    const showSuggestions = open && inputValue.trim().length >= 1;

    return (
        <Box
            sx={{
                position: "sticky",
                top: 0,
                zIndex: 1200,
                backgroundColor: isDark ? "rgba(15,23,42,0.9)" : "rgba(248,250,252,0.97)",
                backdropFilter: "blur(14px)",
                borderBottom: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 2px 16px rgba(15,23,42,0.05)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1.5, md: 3 },
                    px: { xs: 2, md: 5 },
                    py: 1.4,
                    minHeight: "72px",
                }}
            >
                {/* LOGO */}
                <Box
                    onClick={handleLogoClick}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", flexShrink: 0 }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="UniTrade"
                        sx={{ height: { xs: 44, md: 52 }, width: "auto", objectFit: "contain" }}
                    />
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.1 }}>
                            UniTrade
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: theme.palette.text.secondary, fontWeight: 500, mt: 0.2 }}>
                            Campus Marketplace
                        </Typography>
                    </Box>
                </Box>

                {/* ─── SEARCH WRAPPER (relative for dropdown) ─── */}
                <Box sx={{ flex: 1, position: "relative" }}>
                    {/* Search Input Bar */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            borderRadius: open ? "14px 14px 0 0" : "14px",
                            border: open ? "1.5px solid #3b82f6" : `1.5px solid ${isDark ? "#334155" : "#dbe6fb"}`,
                            borderBottom: open ? `1.5px solid ${isDark ? "#334155" : "#e8eef8"}` : `1.5px solid ${isDark ? "#334155" : "#dbe6fb"}`,
                            backgroundColor: isDark ? "#1e293b" : "#ffffff",
                            boxShadow: open
                                ? "0 4px 0 rgba(59,130,246,0.10)"
                                : "0 2px 12px rgba(37,99,235,0.06)",
                            overflow: "hidden",
                            transition: "border-radius 0.15s ease, border 0.2s ease, box-shadow 0.2s ease",
                        }}
                    >

                        {/* Left search icon — decorative only */}
                        <Box sx={{ pl: 2.5, pr: 1, display: "flex", alignItems: "center", pointerEvents: "none", flexShrink: 0 }}>
                            <SearchIcon sx={{ color: open ? "#3b82f6" : "#94a3b8", fontSize: "1.6rem", transition: "color 0.25s" }} />
                        </Box>

                        <InputBase
                            inputRef={inputRef}
                            fullWidth
                            value={inputValue}
                            onChange={(e) => {
                                const val = e.target.value;
                                setInputValue(val);
                                if (isHome) setSearch?.(val);
                                setActiveIndex(-1);
                                if (!open) setOpen(true);
                            }}
                            onFocus={handleFocus}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { handleSubmit(); }
                                else if (e.key === "Escape") { setOpen(false); setActiveIndex(-1); }
                                else if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
                                }
                                else if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
                                }
                            }}
                            placeholder="Search for books, electronics, tools and more..."
                            inputProps={{ "aria-label": "search items", autoComplete: "off" }}
                            sx={{
                            pl: 0,
                            py: 1.3,
                            fontSize: "0.93rem",
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                            "& input::placeholder": { color: isDark ? "#64748b" : "#a0aec0", fontWeight: 400 },
                        }}
                        />

                        {inputValue && (
                            <Box sx={{ pr: 2, display: "flex", alignItems: "center" }}>
                                <ClearIcon
                                    onClick={handleClear}
                                    sx={{ color: "#94a3b8", fontSize: "1.1rem", cursor: "pointer", "&:hover": { color: "#475569" } }}
                                />
                            </Box>
                        )}

                    </Box>

                    {/* ─── DROPDOWN ─── */}
                    {open && (
                        <Paper
                            ref={dropdownRef}
                            elevation={0}
                            sx={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                zIndex: 1300,
                                borderRadius: "0 0 16px 16px",
                                border: "1.5px solid #3b82f6",
                                borderTop: "none",
                                backgroundColor: "background.paper",
                                boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.4)" : "0 16px 40px rgba(15,23,42,0.12)",
                                overflow: "hidden",
                                maxHeight: "420px",
                                overflowY: "auto",
                            }}
                        >
                            {/* ── LIVE SUGGESTIONS ── */}
                            {showSuggestions && (
                                <Box>
                                    {suggestions.length === 0 ? (
                                        hasItemsSource && (
                                            <Box sx={{ px: 3, py: 2.5, color: "#94a3b8", fontSize: "0.9rem" }}>
                                                No results for "<strong>{inputValue}</strong>"
                                            </Box>
                                        )
                                    ) : (
                                        suggestions.map((item, idx) => (
                                            <Box
                                                key={item.id}
                                                onClick={() => handleSelect(item.title)}
                                                onMouseEnter={() => setActiveIndex(idx)}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 2,
                                                    px: 2.5,
                                                    py: 1.4,
                                                    cursor: "pointer",
                                                    backgroundColor: activeIndex === idx ? (isDark ? "rgba(255,255,255,0.05)" : "#f0f6ff") : "transparent",
                                                    transition: "background 0.15s",
                                                    "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f0f6ff" },
                                                }}
                                            >
                                                <SearchIcon sx={{ color: "#94a3b8", fontSize: "1.1rem", flexShrink: 0 }} />
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: "0.92rem", color: "text.primary", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        <HighlightMatch text={item.title} query={inputValue} />
                                                    </Typography>
                                                    {item.category && (
                                                        <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8", mt: 0.1 }}>
                                                            in {item.category}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <NorthWestIcon
                                                    onClick={(e) => { e.stopPropagation(); setSearch(item.title); inputRef.current?.focus(); }}
                                                    sx={{ color: "#cbd5e1", fontSize: "1rem", flexShrink: 0, "&:hover": { color: "#3b82f6" }, transition: "color 0.15s" }}
                                                    titleAccess="Fill in search bar"
                                                />
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            )}

                            {/* ── EMPTY STATE: Recent + Trending ── */}
                            {showEmpty && (
                                <Box>
                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 && (
                                        <Box>
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, pt: 2, pb: 0.5 }}>
                                                <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                                                    Recent Searches
                                                </Typography>
                                                <Typography
                                                    onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]); }}
                                                    sx={{ fontSize: "0.78rem", color: "#3b82f6", fontWeight: 700, cursor: "pointer", "&:hover": { color: "#1d4ed8" } }}
                                                >
                                                    Clear all
                                                </Typography>
                                            </Box>
                                            {recentSearches.map((term) => (
                                                <Box
                                                    key={term}
                                                    onClick={() => handleSelect(term)}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 2,
                                                        px: 2.5,
                                                        py: 1.2,
                                                        cursor: "pointer",
                                                        "&:hover": { backgroundColor: "#f0f6ff" },
                                                        transition: "background 0.15s",
                                                    }}
                                                >
                                                    <AccessTimeIcon sx={{ color: "#94a3b8", fontSize: "1.05rem", flexShrink: 0 }} />
                                                    <Typography sx={{ flex: 1, fontSize: "0.92rem", color: "text.primary", fontWeight: 500 }}>
                                                        {term}
                                                    </Typography>
                                                    <ClearIcon
                                                        onClick={(e) => handleRemoveRecent(e, term)}
                                                        sx={{ color: "#cbd5e1", fontSize: "0.95rem", cursor: "pointer", "&:hover": { color: "#64748b" }, transition: "color 0.15s" }}
                                                    />
                                                </Box>
                                            ))}
                                            <Divider sx={{ mx: 2, my: 1, borderColor: "#f1f5f9" }} />
                                        </Box>
                                    )}

                                    {/* Trending */}
                                    <Box sx={{ px: 2.5, pt: 1, pb: 2 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                            <TrendingUpIcon sx={{ color: "#f59e0b", fontSize: "1.05rem" }} />
                                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                                                Popular on UniTrade
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                            {TRENDING.map((term) => (
                                                <Box
                                                    key={term}
                                                    onClick={() => handleSelect(term)}
                                                    sx={{
                                                        px: 1.8,
                                                        py: 0.6,
                                                        borderRadius: "20px",
                                                        border: "1px solid",
                                                        borderColor: "divider",
                                                        backgroundColor: "background.subtle",
                                                        fontSize: "0.85rem",
                                                        fontWeight: 600,
                                                        color: "text.secondary",
                                                        cursor: "pointer",
                                                        transition: "all 0.18s ease",
                                                        "&:hover": {
                                                            backgroundColor: "#eef4ff",
                                                            borderColor: "#3b82f6",
                                                            color: "#2563eb",
                                                            transform: "translateY(-1px)",
                                                        },
                                                    }}
                                                >
                                                    {term}
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    )}
                </Box>

                {/* ─── RIGHT ACTIONS ─── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 }, flexShrink: 0 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/sell")}
                        sx={{
                            bgcolor: "#2563eb",
                            color: "white",
                            borderRadius: "12px",
                            px: { xs: 2, md: 2.5 },
                            py: 1.1,
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            boxShadow: "0 4px 14px rgba(37,99,235,0.2)",
                            display: { xs: "none", sm: "flex" },
                            "&:hover": { bgcolor: "#1d4ed8", transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(37,99,235,0.3)" },
                        }}
                    >
                        Sell
                    </Button>

                    <IconButton
                        onClick={() => navigate("/sell")}
                        sx={{
                            display: { xs: "flex", sm: "none" },
                            width: 42, height: 42,
                            borderRadius: "12px",
                            backgroundColor: "#2563eb",
                            color: "white",
                            "&:hover": { backgroundColor: "#1d4ed8" },
                        }}
                    >
                        <AddIcon />
                    </IconButton>

                    <IconButton
                        onClick={toggleColorMode}
                        sx={{
                            width: 42, height: 42,
                            borderRadius: "12px",
                            backgroundColor: isDark ? "#1e293b" : "#ffffff",
                            border: "1px solid",
                            borderColor: isDark ? "#334155" : "#e2e8f0",
                            transition: "all 0.25s ease",
                            "&:hover": { backgroundColor: isDark ? "#334155" : "#eef4ff", borderColor: isDark ? "#475569" : "#bfdbfe", transform: "translateY(-1px)" },
                        }}
                    >
                        {isDark ? <LightModeIcon sx={{ color: "#f59e0b" }} /> : <DarkModeIcon sx={{ color: "#334155" }} />}
                    </IconButton>

                    <IconButton
                        onClick={handleNotifClick}
                        sx={{
                            width: 42, height: 42,
                            borderRadius: "12px",
                            backgroundColor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            transition: "all 0.25s ease",
                            "&:hover": { backgroundColor: "background.subtle", borderColor: "primary.main", transform: "translateY(-1px)" },
                        }}
                    >
                        <Badge badgeContent={unreadCount} color="error" overlap="circular" anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                            <NotificationsNoneIcon sx={{ color: "#334155" }} />
                        </Badge>
                    </IconButton>

                    <Popover
                        open={isNotifOpen}
                        anchorEl={notifAnchorEl}
                        onClose={handleNotifClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                width: 320,
                                maxHeight: 400,
                                borderRadius: "16px",
                                backgroundColor: "background.paper",
                                boxShadow: isDark ? "0 10px 40px rgba(0,0,0,0.4)" : "0 10px 40px rgba(15,23,42,0.12)",
                                border: "1px solid",
                                borderColor: "divider",
                            }
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "text.primary" }}>
                                Notifications
                            </Typography>
                        </Box>
                        <Box sx={{ p: 0 }}>
                            {notifications.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: "center" }}>
                                    <NotificationsNoneIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                                    <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>
                                        No notifications yet
                                    </Typography>
                                </Box>
                            ) : (
                                notifications.map((notif) => (
                                    <Box
                                        key={notif.id}
                                        onClick={() => handleNotifItemClick(notif)}
                                        sx={{
                                            p: 2,
                                            cursor: "pointer",
                                            display: "flex",
                                            gap: 2,
                                            alignItems: "flex-start",
                                            backgroundColor: notif.read ? "transparent" : (isDark ? "rgba(37,99,235,0.1)" : "#f0f6ff"),
                                            borderBottom: "1px solid",
                                            borderColor: "divider",
                                            "&:hover": { backgroundColor: "background.subtle" },
                                            transition: "background 0.2s"
                                        }}
                                    >
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontSize: "0.9rem", color: "text.primary", fontWeight: notif.read ? 500 : 700 }}>
                                                {notif.message}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.5 }}>
                                                {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                            </Typography>
                                        </Box>
                                        {!notif.read && (
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3b82f6", mt: 0.5 }} />
                                        )}
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Popover>

                    <Avatar
                        src={editData?.profilePhoto || "/default-avatar.png"}
                        alt={editData?.name || "Profile"}
                        onClick={() => navigate("/profile")}
                        sx={{
                            width: 42, height: 42,
                            cursor: "pointer",
                            border: "2px solid",
                            borderColor: "background.paper",
                            boxShadow: "0 4px 14px rgba(15,23,42,0.10)",
                            transition: "all 0.25s ease",
                            "&:hover": { transform: "scale(1.05)", boxShadow: "0 8px 20px rgba(37,99,235,0.20)" },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}