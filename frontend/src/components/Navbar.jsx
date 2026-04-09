import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
    Avatar,
    Typography,
    Badge,
    Button,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation(); // 🔥 لمعرفة الصفحة الحالية
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;

            try {
                const userRef = doc(db, "users", auth.currentUser.uid);
                const userSnap = await getDoc(userRef);
                setEditData(userSnap.exists() ? userSnap.data() : {});
            } catch (error) {
                console.error("Error fetching navbar user data:", error);
                setEditData({});
            }
        };

        fetchUserData();
    }, []);

    // 🔥 التعامل مع ضغط اللوجو
    const handleLogoClick = () => {
        if (location.pathname === "/home") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            navigate("/home");
        }
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: "rgba(248, 250, 252, 0.88)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid #e2e8f0",
                color: "#0f172a",
            }}
        >
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: { xs: 2, md: 5 },
                    py: 1.2,
                    minHeight: "78px !important",
                }}
            >
                {/* LOGO */}
                <Box
                    onClick={handleLogoClick} // 🔥 التعديل هنا
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        cursor: "pointer",
                    }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="UniTrade"
                        sx={{
                            height: { xs: 48, md: 58 },
                            width: "auto",
                            objectFit: "contain",
                        }}
                    />

                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        <Typography
                            sx={{
                                fontSize: "1.25rem",
                                fontWeight: 800,
                                color: "#0f172a",
                                lineHeight: 1.1,
                            }}
                        >
                            UniTrade
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "0.82rem",
                                color: "#64748b",
                                fontWeight: 500,
                                mt: 0.2,
                            }}
                        >
                            Campus Marketplace
                        </Typography>
                    </Box>
                </Box>

                {/* RIGHT ICONS */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, md: 2 },
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/sell")}
                        sx={{
                            bgcolor: "#2563eb",
                            color: "white",
                            borderRadius: "14px",
                            px: { xs: 2, md: 3 },
                            py: 1.1,
                            textTransform: "none",
                            fontWeight: 700,
                            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.2)",
                            display: { xs: "none", sm: "flex" },
                            "&:hover": {
                                bgcolor: "#1d4ed8",
                                transform: "translateY(-1px)",
                                boxShadow: "0 6px 20px rgba(37, 99, 235, 0.3)",
                            },
                        }}
                    >
                        Sell
                    </Button>

                    {/* Mobile Sell Icon */}
                    <IconButton
                        onClick={() => navigate("/sell")}
                        sx={{
                            display: { xs: "flex", sm: "none" },
                            width: 44,
                            height: 44,
                            borderRadius: "14px",
                            backgroundColor: "#2563eb",
                            color: "white",
                            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.2)",
                            "&:hover": {
                                backgroundColor: "#1d4ed8",
                            },
                        }}
                    >
                        <AddIcon />
                    </IconButton>

                    <IconButton
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "14px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            transition: "all 0.25s ease",
                            "&:hover": {
                                backgroundColor: "#eef4ff",
                                borderColor: "#bfdbfe",
                                transform: "translateY(-1px)",
                            },
                        }}
                    >
                        <Badge
                            color="error"
                            variant="dot"
                            overlap="circular"
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                        >
                            <NotificationsNoneIcon
                                sx={{ color: "#334155" }}
                            />
                        </Badge>
                    </IconButton>

                    <Avatar
                        src={
                            editData?.profilePhoto ||
                            "/default-avatar.png"
                        }
                        alt={editData?.name || "Profile"}
                        sx={{
                            width: 44,
                            height: 44,
                            cursor: "pointer",
                            border: "2px solid #ffffff",
                            boxShadow:
                                "0 4px 14px rgba(15, 23, 42, 0.10)",
                            transition: "all 0.25s ease",
                            "&:hover": {
                                transform: "scale(1.05)",
                                boxShadow:
                                    "0 8px 20px rgba(37, 99, 235, 0.20)",
                            },
                        }}
                        onClick={() => navigate("/profile")}
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
}