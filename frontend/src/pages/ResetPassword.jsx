// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import {
    Box,
    Button,
    CssBaseline,
    TextField,
    Typography,
    Alert,
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logo from "../assets/logo.png";
import { forgotPassword } from "../services/auth";

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
    [theme.breakpoints.down('sm')]: {
        padding: "32px 24px",
        margin: "16px",
    },
}));


/* ================= INPUTS ================= */
const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        backgroundColor: theme.palette.mode === 'light' ? 'rgba(241,245,249,0.6)' : 'rgba(255,255,255,0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
export default function ResetPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!email) {
            setError("Please enter your email.");
            return;
        }
        setError("");
        try {
            setLoading(true);
            await forgotPassword(email);
            setSubmitted(true);
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
                <Box sx={{
                    position: "absolute", inset: 0, zIndex: 1,
                    backgroundImage: (t) => t.palette.mode === 'light'
                        ? `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.04) 1px, transparent 0)`
                        : `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                }} />

                <GlassCard>
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
                                width: "180px", height: "auto", position: "relative",
                                filter: "drop-shadow(0 8px 24px rgba(37,99,235,0.15))",
                            }} />
                        </Box>
                    </Box>

                    <Typography variant="h4" textAlign="center" fontWeight={900} mb={1} color="text.primary" sx={{ letterSpacing: "-0.5px" }}>
                        Reset Password
                    </Typography>

                    {!submitted ? (
                        <>
                            <Typography textAlign="center" mb={4} sx={{ color: "text.secondary", fontSize: "0.95rem", fontWeight: 500 }}>
                                Enter your email address to receive a recovery link
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2.5, borderRadius: "14px", "& .MuiAlert-icon": { alignItems: "center" } }}>
                                    {error}
                                </Alert>
                            )}
                            
                            <Box display="flex" flexDirection="column" gap={3} sx={{ mb: 4 }}>
                                <StyledTextField
                                    label="Email Address" placeholder="you@example.com" fullWidth variant="outlined"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 20 }} /></InputAdornment>) }}
                                />
                            </Box>

                            <SoftButton fullWidth onClick={handleSubmit} disabled={loading}>
                                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Send Reset Link"}
                            </SoftButton>

                            <Box textAlign="center" mt={3}>
                                <Typography
                                    sx={{
                                        fontSize: "0.9rem", cursor: "pointer", fontWeight: 700,
                                        display: "inline-flex", alignItems: "center", gap: 0.5,
                                        color: (t) => t.palette.mode === 'light' ? "#2563eb" : "#60a5fa",
                                        transition: "all 0.2s ease",
                                        "&:hover": { textDecoration: "underline", transform: "translateX(-2px)" },
                                    }}
                                    onClick={() => navigate("/login")}
                                >
                                    <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to Login
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ animation: `${fadeInUp} 0.6s ease` }}>
                            <Alert severity="success" sx={{ mb: 4, borderRadius: "14px" }}>
                                We sent a password reset link to <strong>{email}</strong>.
                                <br />
                                Please check your inbox.
                            </Alert>

                            <SoftButton fullWidth onClick={() => navigate("/login")}>
                                Back to Login
                            </SoftButton>
                        </Box>
                    )}
                </GlassCard>
            </PageWrapper>
        </>
    );
}