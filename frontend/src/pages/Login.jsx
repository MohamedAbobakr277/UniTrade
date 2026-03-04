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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth"; // ربط بالخدمة

/* ================= BACKGROUND ================= */

const PageWrapper = styled(Box)({
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background:
        "linear-gradient(135deg, #e0ecff 0%, #c8dcff 40%, #b7d1ff 100%)",
});

const BlurTop = styled(Box)({
    position: "absolute",
    top: "-150px",
    right: "-150px",
    width: "400px",
    height: "400px",
    background: "#9ec5ff",
    borderRadius: "50%",
    filter: "blur(120px)",
    opacity: 0.4,
});

const BlurBottom = styled(Box)({
    position: "absolute",
    bottom: "-150px",
    left: "-150px",
    width: "400px",
    height: "400px",
    background: "#b7d1ff",
    borderRadius: "50%",
    filter: "blur(120px)",
    opacity: 0.4,
});

/* ================= CARD ================= */

const GlassCard = styled(Box)({
    width: "420px",
    padding: "50px 40px",
    borderRadius: "24px",
    backdropFilter: "blur(20px)",
    background: "rgba(255,255,255,0.75)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
    border: "1px solid rgba(255,255,255,0.4)",
    position: "relative",
    zIndex: 2,
    animation: "fadeIn 0.6s ease",
    "@keyframes fadeIn": {
        from: { opacity: 0, transform: "translateY(20px)" },
        to: { opacity: 1, transform: "translateY(0)" },
    },
});

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
    const [error, setError] = useState("");

    const navigate = useNavigate();

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
            await login(email, password);
            alert("Login successful!");
            navigate("/home");
        } catch (err) {
            setError(err.message);
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
                        color="#334155"
                    >
                        Sign In
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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

                        <SoftButton fullWidth onClick={handleLogin}>
                            Sign In
                        </SoftButton>

                        <Box textAlign="center" mt={2}>
                            <Typography fontSize="14px" color="#64748b">
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