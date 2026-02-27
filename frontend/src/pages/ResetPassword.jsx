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

const GlassCard = styled(Box)({
    width: "420px",
    padding: "45px 40px",
    borderRadius: "24px",
    backdropFilter: "blur(20px)",
    background: "rgba(255,255,255,0.75)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
    border: "1px solid rgba(255,255,255,0.4)",
    position: "relative",
    zIndex: 2,
});

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

    const handleSubmit = () => {
        if (!email) {
            setError("Please enter your email.");
            return;
        }

        setError("");
        setSubmitted(true);

        // Later connect to backend API
    };

    return (
        <>
            <CssBaseline />
            <PageWrapper>
                <BlurTop />
                <BlurBottom />

                <GlassCard>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                        <img
                            src={logo}
                            alt="Logo"
                            style={{ width: "200px" }}
                        />
                    </Box>

                    <Typography
                        variant="h4"
                        textAlign="center"
                        fontWeight={600}
                        mb={3}
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