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
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../assets/logo.png";
import { signUp } from "../services/auth";

/* ================= STYLES ================= */

const PageWrapper = styled(Box)(({ theme }) => ({
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.palette.mode === 'light'
        ? "linear-gradient(135deg, #f0f7ff 0%, #e0ecff 40%, #c8dcff 100%)"
        : "linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e293b 100%)",
}));

const GlassCard = styled(Box)(({ theme }) => ({
    width: "100%",
    maxWidth: "500px",
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
                <GlassCard>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                        <img src={logo} alt="Logo" style={{ width: "200px" }} />
                    </Box>

                    {!submitted ? (
                        <>
                             <Typography variant="h4" textAlign="center" mb={4} color="text.primary" fontWeight={900} sx={{ letterSpacing: "-0.5px" }}>
                                Create Account
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box display="flex" flexDirection="column" gap={3}>
                                <StyledTextField
                                    label="First Name"
                                    name="firstName"
                                    onChange={handleChange}
                                    fullWidth
                                />

                                <StyledTextField
                                    label="Last Name"
                                    name="lastName"
                                    onChange={handleChange}
                                    fullWidth
                                />

                                <StyledTextField
                                    label="Email"
                                    name="email"
                                    onChange={handleChange}
                                    fullWidth
                                />

                                <StyledTextField
                                    label="Phone Number"
                                    name="phone"
                                    onChange={handleChange}
                                    fullWidth
                                />

                                {/* University */}
                                <FormControl fullWidth sx={{ 
                                    '& .MuiOutlinedInput-root': { borderRadius: '16px' },
                                    '& .MuiInputLabel-root': { color: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }
                                }}>
                                    <InputLabel>University</InputLabel>
                                    <Select
                                        value={selectedUniversity}
                                        label="University"
                                        onChange={(e) => {
                                            setSelectedUniversity(e.target.value);
                                            setSelectedFaculty("");
                                        }}
                                        sx={{ borderRadius: '16px' }}
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
                                </FormControl>

                                {selectedUniversity === "Others" && (
                                    <StyledTextField
                                        label="Enter Your University"
                                        value={customUniversity}
                                        onChange={(e) => setCustomUniversity(e.target.value)}
                                        fullWidth
                                    />
                                )}

                                {/* Faculty */}
                                <FormControl fullWidth disabled={!selectedUniversity} sx={{ 
                                    '& .MuiOutlinedInput-root': { borderRadius: '16px' },
                                    '& .MuiInputLabel-root': { color: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }
                                }}>
                                    <InputLabel>Faculty</InputLabel>
                                    <Select
                                        value={selectedFaculty}
                                        label="Faculty"
                                        onChange={(e) => setSelectedFaculty(e.target.value)}
                                        sx={{ borderRadius: '16px' }}
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
                                </FormControl>

                                {selectedFaculty === "Others" && (
                                    <StyledTextField
                                        label="Enter Your Faculty"
                                        value={customFaculty}
                                        onChange={(e) => setCustomFaculty(e.target.value)}
                                        fullWidth
                                    />
                                )}

                                {/* Password */}
                                <StyledTextField
                                    label="Password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    onChange={handleChange}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    sx={{ mr: 1, color: 'text.secondary' }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Confirm Password */}
                                <StyledTextField
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    onChange={handleChange}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() =>
                                                        setShowConfirmPassword(!showConfirmPassword)
                                                    }
                                                    sx={{ mr: 1, color: 'text.secondary' }}
                                                >
                                                    {showConfirmPassword ? (
                                                        <VisibilityOff />
                                                    ) : (
                                                        <Visibility />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <SoftButton fullWidth onClick={handleSubmit}>
                                    Sign Up
                                </SoftButton>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Typography variant="h5" textAlign="center" mb={2}>
                                Verify Your Email
                            </Typography>

                            <Alert severity="success" sx={{ mb: 3 }}>
                                We have sent a verification link to{" "}
                                <strong>{formData.email}</strong>.
                                <br />
                                Please check your inbox and click the link to activate your
                                account.
                            </Alert>

                            <Typography
                                variant="body2"
                                textAlign="center"
                                color="text.secondary"
                                mb={3}
                            >
                                If you don’t see the email, check your spam folder.
                            </Typography>

                            <SoftButton fullWidth onClick={() => navigate("/login")}>
                                Go to Login
                            </SoftButton>
                        </>
                    )}
                </GlassCard>
            </PageWrapper>
        </>
    );
}