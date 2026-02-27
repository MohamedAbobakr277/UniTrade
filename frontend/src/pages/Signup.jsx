import React, { useState, useRef } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

/* BACKGROUND */

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

export default function Signup() {
    const navigate = useNavigate();

    /* STATES */

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    const [selectedUniversity, setSelectedUniversity] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("");

    const [customUniversity, setCustomUniversity] = useState("");
    const [customFaculty, setCustomFaculty] = useState("");

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputsRef = useRef([]);

    /*HANDLERS*/

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = () => {
        if (
            !formData.firstName ||
            !formData.lastName ||
            !formData.email ||
            !formData.phone ||
            !selectedUniversity ||
            !selectedFaculty ||
            (selectedUniversity === "Other" && !customUniversity) ||
            (selectedFaculty === "Other" && !customFaculty)
        ) {
            setError("Please fill all required fields.");
            return;
        }

        setError("");
        setSubmitted(true);
    };

    /* OTP Logic */

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value && index < 5) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handleVerify = () => {
        const code = otp.join("");
        if (code.length < 6) {
            alert("Please enter full verification code.");
            return;
        }

        alert("Account Verified Successfully!");
        navigate("/login");
    };

    /* UI */

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

                    {!submitted ? (
                        <>
                            <Typography
                                variant="h4"
                                textAlign="center"
                                fontWeight={600}
                                mb={4}
                            >
                                Create Account
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
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
                                        <MenuItem value="Cairo University">
                                            Cairo University
                                        </MenuItem>
                                        <MenuItem value="Ain Shams University">
                                            Ain Shams University
                                        </MenuItem>
                                        <MenuItem value="Alexandria University">
                                            Alexandria University
                                        </MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>

                                {selectedUniversity === "Other" && (
                                    <TextField
                                        label="Enter Your University"
                                        fullWidth
                                        value={customUniversity}
                                        onChange={(e) =>
                                            setCustomUniversity(e.target.value)
                                        }
                                    />
                                )}

                                {/* Faculty */}
                                <FormControl
                                    fullWidth
                                    disabled={!selectedUniversity}
                                >
                                    <InputLabel>Faculty</InputLabel>
                                    <Select
                                        value={selectedFaculty}
                                        label="Faculty"
                                        onChange={(e) =>
                                            setSelectedFaculty(e.target.value)
                                        }
                                    >
                                        <MenuItem value="Engineering">
                                            Engineering
                                        </MenuItem>
                                        <MenuItem value="Medicine">Medicine</MenuItem>
                                        <MenuItem value="Commerce">Commerce</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>

                                {selectedFaculty === "Other" && (
                                    <TextField
                                        label="Enter Your Faculty"
                                        fullWidth
                                        value={customFaculty}
                                        onChange={(e) =>
                                            setCustomFaculty(e.target.value)
                                        }
                                    />
                                )}

                                <SoftButton fullWidth onClick={handleSubmit}>
                                    Sign Up
                                </SoftButton>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Typography
                                variant="h4"
                                textAlign="center"
                                fontWeight={600}
                                mb={2}
                            >
                                Verify Your Email
                            </Typography>

                            <Alert severity="success" sx={{ mb: 3 }}>
                                We sent a verification code to {formData.email}
                            </Alert>

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                gap={1}
                                mb={3}
                            >
                                {otp.map((data, index) => (
                                    <TextField
                                        key={index}
                                        inputRef={(el) =>
                                            (inputsRef.current[index] = el)
                                        }
                                        value={data}
                                        onChange={(e) =>
                                            handleOtpChange(e.target, index)
                                        }
                                        inputProps={{
                                            maxLength: 1,
                                            style: {
                                                textAlign: "center",
                                                fontSize: "20px",
                                            },
                                        }}
                                        sx={{ width: "50px" }}
                                    />
                                ))}
                            </Box>

                            <SoftButton fullWidth onClick={handleVerify}>
                                Verify Account
                            </SoftButton>
                        </>
                    )}
                </GlassCard>
            </PageWrapper>
        </>
    );
}