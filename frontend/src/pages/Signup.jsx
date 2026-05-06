// src/pages/Signup.jsx
import React, { useState } from "react";
import {
    Box,
    Button,
    CssBaseline,
    TextField,
    Typography,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import logo from "../assets/logo.png";
import { signUp } from "../services/auth";

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
const scaleIn = keyframes`
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
`;

/* ================= STYLES ================= */
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

const GlassCard = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: "540px",
    padding: "40px 35px",
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
    margin: "20px",
    position: "relative",
    zIndex: 2,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: `${fadeInUp} 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
    "&:hover": {
        boxShadow: theme.palette.mode === 'light'
            ? "0 30px 70px -12px rgba(37,99,235,0.12), 0 0 0 1px rgba(255,255,255,0.6) inset"
            : "0 30px 70px -12px rgba(59,130,246,0.2), 0 0 0 1px rgba(255,255,255,0.08) inset",
    },
}));

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
    '& .MuiOutlinedInput-input': { padding: '14px 18px', fontWeight: 500 },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        color: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)',
        transition: 'color 0.3s ease',
    },
    '&:focus-within .MuiInputAdornment-positionStart .MuiSvgIcon-root': {
        color: theme.palette.mode === 'light' ? '#3b82f6' : '#60a5fa',
    },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.mode === 'light' ? '#3b82f6' : '#60a5fa',
            borderWidth: '2px',
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
}));

const SoftButton = styled(Button)(({ theme }) => ({
    background: theme.palette.mode === 'light'
        ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)"
        : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)",
    color: "#fff",
    padding: "14px",
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

/* ================= COMPONENT ================= */
export default function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [selectedUniversity, setSelectedUniversity] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [customUniversity, setCustomUniversity] = useState("");
    const [customFaculty, setCustomFaculty] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (
            !formData.firstName ||
            !formData.lastName ||
            !formData.email ||
            !formData.phone ||
            !formData.password ||
            !formData.confirmPassword ||
            !selectedUniversity ||
            !selectedFaculty ||
            (selectedUniversity === "Others" && !customUniversity) ||
            (selectedFaculty === "Others" && !customFaculty)
        ) {
            setError("Please fill all required fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!phoneRegex.test(formData.phone)) {
            setError("Please enter a valid phone number.");
            return;
        }

        setError("");

        try {
            await signUp(
                formData.firstName,
                formData.lastName,
                formData.email,
                formData.password,
                selectedFaculty === "Others" ? customFaculty : selectedFaculty,
                selectedUniversity === "Others"
                    ? customUniversity
                    : selectedUniversity,
                formData.phone
            );

            setSubmitted(true);
        } catch (err) {
            setError(err.message);
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
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                        <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Box sx={{
                                position: "absolute", width: "100px", height: "100px", borderRadius: "50%",
                                background: (t) => t.palette.mode === 'light'
                                    ? "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)"
                                    : "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)",
                                filter: "blur(15px)",
                            }} />
                            <img src={logo} alt="Logo" style={{
                                width: "160px", height: "auto", position: "relative",
                                filter: "drop-shadow(0 8px 24px rgba(37,99,235,0.15))",
                            }} />
                        </Box>
                    </Box>

                    {!submitted ? (
                        <>
                            <Typography variant="h4" textAlign="center" mb={0.5} color="text.primary" fontWeight={900} sx={{ letterSpacing: "-0.5px" }}>
                                Create Account
                            </Typography>
                            <Typography textAlign="center" mb={3} sx={{ color: "text.secondary", fontSize: "0.9rem", fontWeight: 500 }}>
                                Join the campus marketplace today
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2, borderRadius: "14px", "& .MuiAlert-icon": { alignItems: "center" } }}>
                                    {error}
                                </Alert>
                            )}

                            <Box display="flex" flexDirection="column" gap={2}>
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <StyledTextField
                                        label="First Name" name="firstName" onChange={handleChange} fullWidth
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 20 }} /></InputAdornment>) }}
                                    />
                                    <StyledTextField
                                        label="Last Name" name="lastName" onChange={handleChange} fullWidth
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 20 }} /></InputAdornment>) }}
                                    />
                                </Box>

                                <StyledTextField
                                    label="Email" name="email" onChange={handleChange} fullWidth
                                    InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 20 }} /></InputAdornment>) }}
                                />

                                <StyledTextField
                                    label="Phone Number" name="phone" onChange={handleChange} fullWidth
                                    InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneOutlinedIcon sx={{ fontSize: 20 }} /></InputAdornment>) }}
                                />

                                <StyledFormControl fullWidth>
                                    <InputLabel>University</InputLabel>
                                    <Select
                                        value={selectedUniversity}
                                        label="University"
                                        onChange={(e) => {
                                            setSelectedUniversity(e.target.value);
                                            setSelectedFaculty("");
                                        }}
                                        startAdornment={<InputAdornment position="start"><SchoolOutlinedIcon sx={{ fontSize: 20, color: (t) => t.palette.mode === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)', ml: 0.5 }} /></InputAdornment>}
                                    >
                                        <MenuItem value="Cairo University">Cairo University</MenuItem>
                                        <MenuItem value="Ain Shams University">Ain Shams University</MenuItem>
                                        <MenuItem value="Alexandria University">Alexandria University</MenuItem>
                                        <MenuItem value="Mansoura University">Mansoura University</MenuItem>
                                        <MenuItem value="Assiut University">Assiut University</MenuItem>
                                        <MenuItem value="Helwan University">Helwan University</MenuItem>
                                        <MenuItem value="Tanta University">Tanta University</MenuItem>
                                        <MenuItem value="Zagazig University">Zagazig University</MenuItem>
                                        <MenuItem value="Suez Canal University">Suez Canal University</MenuItem>
                                        <MenuItem value="Al-Azhar University">Al-Azhar University</MenuItem>
                                        <MenuItem value="German University in Cairo">German University in Cairo</MenuItem>
                                        <MenuItem value="British University in Egypt">British University in Egypt</MenuItem>
                                        <MenuItem value="October 6 University">October 6 University</MenuItem>
                                        <MenuItem value="Future University in Egypt">Future University in Egypt</MenuItem>
                                        <MenuItem value="AASTMT">AASTMT</MenuItem>
                                        <MenuItem value="Nile University">Nile University</MenuItem>
                                        <MenuItem value="Others">Others</MenuItem>
                                    </Select>
                                </StyledFormControl>

                                {selectedUniversity === "Others" && (
                                    <StyledTextField
                                        label="Enter Your University"
                                        value={customUniversity}
                                        onChange={(e) => setCustomUniversity(e.target.value)}
                                        fullWidth
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><SchoolOutlinedIcon sx={{ fontSize: 20 }} /></InputAdornment>) }}
                                    />
                                )}

                                <StyledFormControl fullWidth disabled={!selectedUniversity}>
                                    <InputLabel>Faculty</InputLabel>
                                    <Select
                                        value={selectedFaculty}
                                        label="Faculty"
                                        onChange={(e) => setSelectedFaculty(e.target.value)}
                                        startAdornment={<InputAdornment position="start"><SchoolOutlinedIcon sx={{ fontSize: 20, color: (t) => t.palette.mode === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)', ml: 0.5 }} /></InputAdornment>}
                                    >
                                        <MenuItem value="Engineering">Engineering</MenuItem>
                                        <MenuItem value="Medicine">Medicine</MenuItem>
                                        <MenuItem value="Pharmacy">Pharmacy</MenuItem>
                                        <MenuItem value="Dentistry">Dentistry</MenuItem>
                                        <MenuItem value="Nursing">Nursing</MenuItem>
                                        <MenuItem value="Science">Science</MenuItem>
                                        <MenuItem value="Arts">Arts</MenuItem>
                                        <MenuItem value="Commerce">Commerce</MenuItem>
                                        <MenuItem value="Law">Law</MenuItem>
                                        <MenuItem value="Education">Education</MenuItem>
                                        <MenuItem value="Agriculture">Agriculture</MenuItem>
                                        <MenuItem value="Veterinary Medicine">Veterinary Medicine</MenuItem>
                                        <MenuItem value="Physical Therapy">Physical Therapy</MenuItem>
                                        <MenuItem value="Others">Others</MenuItem>
                                    </Select>
                                </StyledFormControl>

                                {selectedFaculty === "Others" && (
                                    <StyledTextField
                                        label="Enter Your Faculty"
                                        value={customFaculty}
                                        onChange={(e) => setCustomFaculty(e.target.value)}
                                        fullWidth
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><SchoolOutlinedIcon sx={{ fontSize: 20 }} /></InputAdornment>) }}
                                    />
                                )}

                                <StyledTextField
                                    label="Password" name="password"
                                    type={showPassword ? "text" : "password"}
                                    onChange={handleChange} fullWidth
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 20 }} /></InputAdornment>),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ mr: 0.5, color: 'text.secondary' }}>
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <StyledTextField
                                    label="Confirm Password" name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    onChange={handleChange} fullWidth
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 20 }} /></InputAdornment>),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} sx={{ mr: 0.5, color: 'text.secondary' }}>
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <SoftButton fullWidth onClick={handleSubmit}>
                                    Sign Up
                                </SoftButton>

                                <Box textAlign="center" mt={0.5}>
                                    <Typography fontSize="0.9rem" color="text.secondary" fontWeight={500}>
                                        Already have an account?{" "}
                                        <Box component="span" onClick={() => navigate("/login")}
                                            sx={{
                                                color: (t) => t.palette.mode === 'light' ? "#2563eb" : "#60a5fa",
                                                cursor: "pointer", fontWeight: 800, ml: 0.5,
                                                transition: "all 0.2s ease",
                                                "&:hover": { textDecoration: "underline" }
                                            }}
                                        >
                                            Sign in
                                        </Box>
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ textAlign: "center", animation: `${fadeInUp} 0.6s ease` }}>
                            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                                <CheckCircleOutlineIcon sx={{
                                    fontSize: 64, color: "#22c55e",
                                    animation: `${scaleIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                                    filter: "drop-shadow(0 4px 12px rgba(34,197,94,0.3))",
                                }} />
                            </Box>
                            <Typography variant="h5" textAlign="center" mb={1} fontWeight={800} color="text.primary">
                                Verify Your Email
                            </Typography>
                            <Alert severity="success" sx={{ mb: 2.5, borderRadius: "14px", textAlign: "left" }}>
                                We have sent a verification link to <strong>{formData.email}</strong>.
                                <br />
                                Please check your inbox and click the link to activate your account.
                            </Alert>
                            <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
                                If you don't see the email, check your spam folder.
                            </Typography>
                            <SoftButton fullWidth onClick={() => navigate("/login")}>
                                Go to Login
                            </SoftButton>
                        </Box>
                    )}
                </GlassCard>
            </PageWrapper>
        </>
    );
}