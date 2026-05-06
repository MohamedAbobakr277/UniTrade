// src/pages/Login.jsx
import React, { useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    CssBaseline,
    FormControlLabel,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../services/auth";

/* ================= ANIMATIONS ================= */
const float1 = keyframes`
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -50px) scale(1.05); }
`;
const float2 = keyframes`
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-40px, 40px) scale(0.97); }
`;
const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

/* ================= BACKGROUND ================= */
const PageWrapper = styled(Box)(({ theme }) => ({
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background: theme.palette.mode === 'light'
        ? "linear-gradient(135deg, #f0f7ff 0%, #e0ecff 30%, #dbeafe 60%, #c8dcff 100%)"
        : "linear-gradient(135deg, #020617 0%, #0f172a 30%, #1e293b 60%, #0f172a 100%)",
}));

const Orb = styled(Box)(() => ({
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(120px)",
    pointerEvents: "none",
    willChange: "transform",
}));

/* ================= CARD ================= */
const GlassCard = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: "460px",
    padding: "48px 44px",
    borderRadius: "28px",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    background: theme.palette.mode === 'light'
        ? "rgba(255, 255, 255, 0.82)"
        : "rgba(15, 23, 42, 0.7)",
    boxShadow: theme.palette.mode === 'light'
        ? "0 25px 60px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.6) inset"
        : "0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
    border: "1px solid",
    borderColor: theme.palette.mode === 'light'
        ? "rgba(255,255,255,0.7)"
        : "rgba(255,255,255,0.08)",
    position: "relative",
    zIndex: 2,
    margin: "20px",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: `${fadeInUp} 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
    "&:hover": {
        boxShadow: theme.palette.mode === 'light'
            ? "0 30px 70px -12px rgba(37,99,235,0.12), 0 0 0 1px rgba(255,255,255,0.6) inset"
            : "0 30px 70px -12px rgba(59,130,246,0.2), 0 0 0 1px rgba(255,255,255,0.08) inset",
    },
}));

/* ================= INPUTS ================= */
const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        backgroundColor: theme.palette.mode === 'light' ? 'rgba(241,245,249,0.6)' : 'rgba(255,255,255,0.04)',
        transition: 'all 0.3s ease',
        '& fieldset': {
            borderColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
        },
        '&:hover fieldset': {
            borderColor: theme.palette.mode === 'light' ? 'rgba(37,99,235,0.3)' : 'rgba(96,165,250,0.3)',
        },
        '&.Mui-focused': {
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(241,245,249,0.9)' : 'rgba(255,255,255,0.06)',
            '& fieldset': {
                borderColor: theme.palette.mode === 'light' ? '#3b82f6' : '#60a5fa',
                borderWidth: '2px',
            },
        },
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
        fontWeight: 500,
        '&.Mui-focused': {
            color: theme.palette.mode === 'light' ? '#2563eb' : '#60a5fa',
            fontWeight: 700,
        },
    },
    '& .MuiOutlinedInput-input': { padding: '16px 20px', fontWeight: 500 },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)',
        transition: 'color 0.3s ease',
    },
    '&:focus-within .MuiInputAdornment-positionStart .MuiSvgIcon-root': {
        color: theme.palette.mode === 'light' ? '#3b82f6' : '#60a5fa',
    },
}));

/* ================= BUTTON ================= */
const SoftButton = styled(Button)(({ theme }) => ({
    background: theme.palette.mode === 'light'
        ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)"
        : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)",
    color: "#fff",
    padding: "16px",
    borderRadius: "16px",
    fontWeight: 800,
    textTransform: "none",
    fontSize: "17px",
    letterSpacing: "0.5px",
    position: "relative",
    overflow: "hidden",
    boxShadow: theme.palette.mode === 'light'
        ? "0 10px 30px -5px rgba(37,99,235,0.35)"
        : "0 10px 30px -5px rgba(59,130,246,0.25)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&::before": {
        content: '""',
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
        backgroundSize: "200% 100%",
        opacity: 0,
        transition: "opacity 0.3s ease",
    },
    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: theme.palette.mode === 'light'
            ? "0 18px 40px -5px rgba(37,99,235,0.45)"
            : "0 18px 40px -5px rgba(59,130,246,0.35)",
        "&::before": { opacity: 1, animation: `${shimmer} 1.5s ease infinite` },
    },
    "&:active": { transform: "translateY(0) scale(0.98)" },
}));

/* ================= PAGE ================= */
export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const [error, setError] = useState(
        location.state?.banned
            ? "Your account has been suspended. Please contact the administration for more information."
            : ""
    );

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleLogin = async () => {
        setError("");
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        try {
            setLoading(true);
            const result = await login(email, password);
            if (result.role === "admin") {
                navigate("/admindashboard");
            } else {
                navigate("/home");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CssBaseline />
            <PageWrapper>
                {/* Animated floating orbs */}
                <Orb sx={{
                    top: "-80px", right: "-60px", width: "450px", height: "450px",
                    background: (t) => t.palette.mode === 'light' ? "#3b82f6" : "#2563eb",
                    opacity: (t) => t.palette.mode === 'light' ? 0.12 : 0.1,
                    animation: `${float1} 20s ease-in-out infinite`,
                }} />
                <Orb sx={{
                    bottom: "-100px", left: "-80px", width: "500px", height: "500px",
                    background: (t) => t.palette.mode === 'light' ? "#60a5fa" : "#3b82f6",
                    opacity: (t) => t.palette.mode === 'light' ? 0.1 : 0.08,
                    animation: `${float2} 25s ease-in-out infinite`,
                }} />
                <Orb sx={{
                    top: "40%", left: "60%", width: "350px", height: "350px",
                    background: (t) => t.palette.mode === 'light' ? "#818cf8" : "#6366f1",
                    opacity: (t) => t.palette.mode === 'light' ? 0.07 : 0.06,
                    animation: `${float1} 18s ease-in-out infinite reverse`,
                }} />
                {/* Dot-grid overlay */}
                <Box sx={{
                    position: "absolute", inset: 0, zIndex: 1,
                    backgroundImage: (t) => t.palette.mode === 'light'
                        ? `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.04) 1px, transparent 0)`
                        : `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }} />

                <GlassCard>
                    {/* LOGO */}
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                        <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Box sx={{
                                position: "absolute", width: "120px", height: "120px", borderRadius: "50%",
                                background: (t) => t.palette.mode === 'light'
                                    ? "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)"
                                    : "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)",
                                filter: "blur(20px)",
                            }} />
                            <img src={logo} alt="Logo" style={{
                                width: "200px", height: "auto", position: "relative",
                                filter: "drop-shadow(0 8px 24px rgba(37,99,235,0.15))",
                            }} />
                        </Box>
                    </Box>

                    <Typography variant="h4" textAlign="center" fontWeight={900} mb={0.5} color="text.primary" sx={{ letterSpacing: "-0.5px" }}>
                        Welcome Back
                    </Typography>
                    <Typography textAlign="center" mb={4} sx={{ color: "text.secondary", fontSize: "0.95rem", fontWeight: 500 }}>
                        Sign in to your UniTrade account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "14px", "& .MuiAlert-icon": { alignItems: "center" } }}>
                            {error}
                        </Alert>
                    )}

                    <Box display="flex" flexDirection="column" gap={3}>
                        <StyledTextField
                            label="Email" placeholder="youremail@example.com" fullWidth variant="outlined"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 20 }} /></InputAdornment>) }}
                        />
                        <StyledTextField
                            label="Password" type={showPassword ? "text" : "password"} placeholder="*******"
                            fullWidth variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 20 }} /></InputAdornment>),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleTogglePassword} edge="end" sx={{ mr: 0.5, color: 'text.secondary' }}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <FormControlLabel
                                control={<Checkbox sx={{
                                    color: (t) => t.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                                    '&.Mui-checked': { color: (t) => t.palette.mode === 'light' ? '#2563eb' : '#60a5fa' },
                                }} />}
                                label={<Typography sx={{ fontSize: "0.9rem", fontWeight: 500, color: "text.secondary" }}>Remember me</Typography>}
                            />
                            <Typography
                                sx={{
                                    fontSize: "0.9rem", cursor: "pointer", fontWeight: 600,
                                    color: (t) => t.palette.mode === 'light' ? "#2563eb" : "#60a5fa",
                                    transition: "all 0.2s ease",
                                    "&:hover": { textDecoration: "underline" },
                                }}
                                onClick={() => navigate("/reset-password")}
                            >
                                Forgot password?
                            </Typography>
                        </Box>

                        <SoftButton fullWidth onClick={handleLogin} disabled={loading}>
                            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
                        </SoftButton>

                        <Box textAlign="center" mt={2}>
                            <Typography fontSize="0.95rem" color="text.secondary" fontWeight={500}>
                                Don't have an account?{" "}
                                <Box component="span" onClick={() => navigate("/signup")}
                                    sx={{
                                        color: (t) => t.palette.mode === 'light' ? "#2563eb" : "#60a5fa",
                                        cursor: "pointer", fontWeight: 800, ml: 0.5,
                                        transition: "all 0.2s ease",
                                        "&:hover": { textDecoration: "underline" }
                                    }}
                                >
                                    Sign up
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                </GlassCard>
            </PageWrapper>
        </>
    );
}