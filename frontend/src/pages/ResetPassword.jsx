// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import {
    Box,
    Button,
    CssBaseline,
    TextField,
    Typography,
    Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { forgotPassword } from "../services/auth"; // استدعاء الفانكشن من auth.js

/* ================= BACKGROUND ================= */

const PageWrapper = styled(Box)(({ theme }) => ({
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background: theme.palette.mode === 'light'
        ? "linear-gradient(135deg, #f0f7ff 0%, #e0ecff 40%, #c8dcff 100%)"
        : "linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e293b 100%)",
}));

const BlurTop = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: "-100px",
    right: "-100px",
    width: "500px",
    height: "500px",
    background: theme.palette.mode === 'light' ? "#3b82f6" : "#2563eb",
    borderRadius: "50%",
    filter: "blur(140px)",
    opacity: theme.palette.mode === 'light' ? 0.15 : 0.12,
}));

const BlurBottom = styled(Box)(({ theme }) => ({
    position: "absolute",
    bottom: "-100px",
    left: "-100px",
    width: "500px",
    height: "500px",
    background: theme.palette.mode === 'light' ? "#60a5fa" : "#3b82f6",
    borderRadius: "50%",
    filter: "blur(140px)",
    opacity: theme.palette.mode === 'light' ? 0.15 : 0.12,
}));

const GlassCard = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: "440px",
    padding: "50px 45px",
    borderRadius: "32px",
    backdropFilter: "blur(25px)",
    background: theme.palette.mode === 'light' 
        ? "rgba(255, 255, 255, 0.8)" 
        : "rgba(15, 23, 42, 0.65)",
    boxShadow: theme.palette.mode === 'light'
        ? "0 25px 50px -12px rgba(0,0,0,0.08)"
        : "0 25px 50px -12px rgba(0,0,0,0.5)",
    border: "1px solid",
    borderColor: theme.palette.mode === 'light'
        ? "rgba(255,255,255,0.5)"
        : "rgba(255,255,255,0.08)",
    position: "relative",
    zIndex: 2,
    margin: "20px",
    transition: "all 0.3s ease",
    animation: "fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    "@keyframes fadeIn": {
        from: { opacity: 0, transform: "translateY(30px)" },
        to: { opacity: 1, transform: "translateY(0)" },
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
        transition: 'all 0.2s ease',
        '& fieldset': {
            borderColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
        },
        '&:hover fieldset': {
            borderColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.mode === 'light' ? '#3b82f6' : '#60a5fa',
            borderWidth: '2px',
        },
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
        fontWeight: 500,
        '&.Mui-focused': {
            color: theme.palette.mode === 'light' ? '#2563eb' : '#60a5fa',
            fontWeight: 700,
        },
    },
    '& .MuiOutlinedInput-input': {
        padding: '16px 20px',
        fontWeight: 500,
    }
}));

const SoftButton = styled(Button)(({ theme }) => ({
    background: theme.palette.mode === 'light'
        ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
        : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
    color: "#fff",
    padding: "16px",
    borderRadius: "16px",
    fontWeight: 800,
    textTransform: "none",
    fontSize: "17px",
    letterSpacing: "0.5px",
    boxShadow: theme.palette.mode === 'light'
        ? "0 10px 25px -5px rgba(37,99,235,0.4)"
        : "0 10px 25px -5px rgba(59,130,246,0.3)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
        background: theme.palette.mode === 'light'
            ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
            : "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
        transform: "translateY(-2px)",
        boxShadow: theme.palette.mode === 'light'
            ? "0 15px 30px -5px rgba(37,99,235,0.5)"
            : "0 15px 30px -5px rgba(59,130,246,0.4)",
    },
    "&:active": {
        transform: "scale(0.98)",
    },
}));

/* ================= PAGE ================= */

export default function ResetPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!email) {
            setError("Please enter your email.");
            return;
        }

        setError("");

        try {
            await forgotPassword(email); // إرسال الإيميل فعليًا من Firebase
            setSubmitted(true);
        } catch (err) {
            setError(err.message); // عرض أي خطأ يحصل
        }
    };

    return (
        <>
            <CssBaseline />
            <PageWrapper>
                <BlurTop />
                <BlurBottom />

                <GlassCard>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                        <img src={logo} alt="Logo" style={{ width: "200px" }} />
                    </Box>

                    <Typography
                        variant="h4"
                        textAlign="center"
                        fontWeight={900}
                        mb={3}
                        color="text.primary"
                        sx={{ letterSpacing: "-0.5px" }}
                    >
                        Reset Password
                    </Typography>

                    {!submitted ? (
                        <>
                            <Typography
                                textAlign="center"
                                fontSize="14px"
                                color="#64748b"
                                mb={3}
                            >
                                Enter your email address and we will send you a reset link.
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            
                            <Box display="flex" flexDirection="column" gap={3} sx={{ mb: 3 }}>
                                <StyledTextField
                                    label="Email Address"
                                    placeholder="you@example.com"
                                    fullWidth
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Box>

                            <SoftButton fullWidth onClick={handleSubmit}>
                                Send Reset Link
                            </SoftButton>

                            <Typography
                                textAlign="center"
                                mt={3}
                                fontSize="14px"
                            >
                                Back to{" "}
                                <span
                                    style={{
                                        color: "#5da9ff",
                                        cursor: "pointer",
                                        fontWeight: 500,
                                    }}
                                    onClick={() => navigate("/login")}
                                >
                                    Login
                                </span>
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Alert severity="success" sx={{ mb: 3 }}>
                                We sent a password reset link to {email}.
                                <br />
                                Please check your inbox.
                            </Alert>

                            <SoftButton
                                fullWidth
                                onClick={() => navigate("/login")}
                            >
                                Back to Login
                            </SoftButton>
                        </>
                    )}
                </GlassCard>
            </PageWrapper>
        </>
    );
}