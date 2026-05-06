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
import { styled } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../services/auth";

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

/* ================= CARD ================= */

const GlassCard = styled(Box)(({ theme }) => ({
    width: "420px",
    padding: "50px 40px",
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
    animation: "fadeIn 0.6s ease",
    "@keyframes fadeIn": {
        from: { opacity: 0, transform: "translateY(20px)" },
        to: { opacity: 1, transform: "translateY(0)" },
    },
}));

/* ================= BUTTON ================= */

const SoftButton = styled(Button)({
    background: "linear-gradient(90deg, #7db7ff, #5da9ff)",
    color: "#fff",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: 600,
    textTransform: "none",
    fontSize: "16px",
    boxShadow: "0 10px 20px rgba(93,169,255,0.3)",
    transition: "all 0.2s ease",
    "&:hover": {
        background: "linear-gradient(90deg, #5da9ff, #3f95ff)",
    },
    "&:active": {
        transform: "scale(0.98)",
    },
});

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
                <BlurTop />
                <BlurBottom />

                <GlassCard>
                    {/* LOGO */}
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                        <img
                            src={logo}
                            alt="Logo"
                            style={{
                                width: "220px",
                                height: "auto",
                                filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.2))",
                            }}
                        />
                    </Box>

                    <Typography
                        variant="h4"
                        textAlign="center"
                        fontWeight={600}
                        mb={4}
                        color="text.primary"
                    >
                        Sign In
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box display="flex" flexDirection="column" gap={3}>
                        <TextField
                            label="Email"
                            placeholder="youremail@example.com"
                            fullWidth
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <TextField
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="*******"
                            fullWidth
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleTogglePassword} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <FormControlLabel control={<Checkbox />} label="Remember me" />

                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    color: "#5da9ff",
                                    fontWeight: 500,
                                }}
                                onClick={() => navigate("/reset-password")}
                            >
                                Forgot password?
                            </Typography>
                        </Box>

                        <SoftButton
                            fullWidth
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={22} sx={{ color: "#fff" }} />
                            ) : (
                                "Sign In"
                            )}
                        </SoftButton>

                        <Box textAlign="center" mt={2}>
                            <Typography fontSize="14px" color="text.secondary">
                                Don't have an account?{" "}
                                <span
                                    onClick={() => navigate("/signup")}
                                    style={{
                                        color: "#5da9ff",
                                        cursor: "pointer",
                                        fontWeight: 500,
                                    }}
                                >
                                    Sign up
                                </span>
                            </Typography>
                        </Box>
                    </Box>
                </GlassCard>
            </PageWrapper>
        </>
    );
}