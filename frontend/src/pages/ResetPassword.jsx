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
        ? "linear-gradient(135deg, #e0ecff 0%, #c8dcff 40%, #b7d1ff 100%)"
        : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
}));

const BlurTop = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: "-150px",
    right: "-150px",
    width: "400px",
    height: "400px",
    background: theme.palette.mode === 'light' ? "#9ec5ff" : "#1e40af",
    borderRadius: "50%",
    filter: "blur(120px)",
    opacity: theme.palette.mode === 'light' ? 0.4 : 0.2,
}));

const BlurBottom = styled(Box)(({ theme }) => ({
    position: "absolute",
    bottom: "-150px",
    left: "-150px",
    width: "400px",
    height: "400px",
    background: theme.palette.mode === 'light' ? "#b7d1ff" : "#1e40af",
    borderRadius: "50%",
    filter: "blur(120px)",
    opacity: theme.palette.mode === 'light' ? 0.4 : 0.2,
}));

const GlassCard = styled(Box)(({ theme }) => ({
    width: "420px",
    padding: "45px 40px",
    borderRadius: "24px",
    backdropFilter: "blur(20px)",
    background: theme.palette.mode === 'light' 
        ? "rgba(255, 255, 255, 0.75)" 
        : "rgba(30, 41, 59, 0.7)",
    boxShadow: theme.palette.mode === 'light'
        ? "0 20px 60px rgba(0,0,0,0.08)"
        : "0 20px 60px rgba(0,0,0,0.4)",
    border: "1px solid",
    borderColor: theme.palette.mode === 'light'
        ? "rgba(255,255,255,0.4)"
        : "rgba(255,255,255,0.05)",
    position: "relative",
    zIndex: 2,
}));

const SoftButton = styled(Button)({
    background: "linear-gradient(90deg, #7db7ff, #5da9ff)",
    color: "#fff",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: 600,
    textTransform: "none",
    fontSize: "16px",
    boxShadow: "0 10px 20px rgba(93,169,255,0.3)",
    "&:hover": {
        background: "linear-gradient(90deg, #5da9ff, #3f95ff)",
    },
});

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
                        fontWeight={600}
                        mb={3}
                        color="text.primary"
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

                            <TextField
                                label="Email"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: 3 }}
                            />

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