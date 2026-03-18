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

const PageWrapper = styled(Box)({
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
        "linear-gradient(135deg, #e0ecff 0%, #c8dcff 40%, #b7d1ff 100%)",
});

const GlassCard = styled(Box)({
    width: "450px",
    padding: "45px 40px",
    borderRadius: "24px",
    backdropFilter: "blur(20px)",
    background: "rgba(255,255,255,0.75)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
});

const SoftButton = styled(Button)({
    background: "linear-gradient(90deg, #7db7ff, #5da9ff)",
    color: "#fff",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: 600,
    textTransform: "none",
    fontSize: "16px",
    "&:hover": {
        background: "linear-gradient(90deg, #5da9ff, #3f95ff)",
    },
});

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
            (selectedUniversity === "Other" && !customUniversity) ||
            (selectedFaculty === "Other" && !customFaculty)            
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
                selectedFaculty === "Other" ? customFaculty : selectedFaculty,
                selectedUniversity === "Other"
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
                            <Typography variant="h4" textAlign="center" mb={4}>
                                Create Account
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box display="flex" flexDirection="column" gap={3}>
                                <TextField
                                    label="First Name"
                                    name="firstName"
                                    onChange={handleChange}
                                    fullWidth
                                />

                                <TextField
                                    label="Last Name"
                                    name="lastName"
                                    onChange={handleChange}
                                    fullWidth
                                />

                                <TextField
                                    label="Email"
                                    name="email"
                                    onChange={handleChange}
                                    fullWidth
                                />

                                <TextField
                                    label="Phone Number"
                                    name="phone"
                                    onChange={handleChange}
                                    fullWidth
                                />

                                {/* University */}
                                <FormControl fullWidth>
                                    <InputLabel>University</InputLabel>
                                    <Select
                                        value={selectedUniversity}
                                        label="University"
                                        onChange={(e) => {
                                            setSelectedUniversity(e.target.value);
                                            setSelectedFaculty("");
                                        }}
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

                                {selectedUniversity === "Other" && (
                                    <TextField
                                        label="Enter Your University"
                                        value={customUniversity}
                                        onChange={(e) => setCustomUniversity(e.target.value)}
                                        fullWidth
                                    />
                                )}

                                {/* Faculty */}
                                <FormControl fullWidth disabled={!selectedUniversity}>
                                    <InputLabel>Faculty</InputLabel>
                                    <Select
                                        value={selectedFaculty}
                                        label="Faculty"
                                        onChange={(e) => setSelectedFaculty(e.target.value)}
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
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>

                                {selectedFaculty === "Other" && (
                                    <TextField
                                        label="Enter Your Faculty"
                                        value={customFaculty}
                                        onChange={(e) => setCustomFaculty(e.target.value)}
                                        fullWidth
                                    />
                                )}

                                {/* Password */}
                                <TextField
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
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Confirm Password */}
                                <TextField
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