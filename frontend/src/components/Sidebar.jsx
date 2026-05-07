import {
    Box,
    Typography,
    Button,
    Slider,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Divider,
    Paper,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MultiSelectUniversitiesDropdown from "./MultiSelectUniversitiesDropdown";

export default function Sidebar({ selectedUniversities, setSelectedUniversities, priceRange, setPriceRange, selectedConditions, setSelectedConditions, }) {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                width: { xs: "100%", md: 280 },
                minHeight: { md: "100vh" },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    borderRadius: "24px",
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: (theme) => theme.palette.mode === 'light' ? "0 8px 30px rgba(15, 23, 42, 0.05)" : "none",
                    position: "sticky",
                    top: 20,
                }}
            >
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <StorefrontOutlinedIcon sx={{ color: 'primary.main' }} />
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: "text.primary",
                            fontSize: "1.1rem",
                        }}
                    >
                        Categories
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        color: "text.secondary",
                        fontSize: "0.92rem",
                        lineHeight: 1.7,
                        mb: 2.5,
                    }}
                >
                    Filter listings by university, price, and product condition to find
                    exactly what you need.
                </Typography>

                {/* Sell Button */}
                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate("/sell")}
                    startIcon={<AddShoppingCartOutlinedIcon />}
                    sx={{
                        mb: 3,
                        py: 1.4,
                        borderRadius: "16px",
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        letterSpacing: "0.2px",
                        background: (theme) => theme.palette.mode === 'light'
                            ? "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)"
                            : "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
                        boxShadow: "0 10px 20px rgba(37,99,235,0.25)",
                        "&:hover": {
                            background: (theme) => theme.palette.mode === 'light'
                                ? "linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)"
                                : "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
                            boxShadow: "0 12px 24px rgba(37,99,235,0.32)",
                            transform: "translateY(-1px)",
                        },
                    }}
                >
                    SELL YOUR ITEM
                </Button>

                <Divider sx={{ mb: 3 }} />

                {/* Filter by University */}
                <Box
                    sx={{
                        mb: 3,
                        p: 1.6,
                        borderRadius: "18px",
                        backgroundColor: "background.subtle",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                        <SchoolOutlinedIcon sx={{ color: "success.main", fontSize: 20 }} />
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: "text.primary",
                                fontSize: "0.98rem",
                            }}
                        >
                            Filter by University
                        </Typography>
                    </Box>

                    <MultiSelectUniversitiesDropdown
                        selectedUniversities={selectedUniversities}
                        setSelectedUniversities={setSelectedUniversities}
                    />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Filter by Price */}
                <Box
                    sx={{
                        mb: 3,
                        p: 1.6,
                        borderRadius: "18px",
                        backgroundColor: "background.subtle",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <PaidOutlinedIcon sx={{ color: "warning.main", fontSize: 20 }} />
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: "text.primary",
                                fontSize: "0.98rem",
                            }}
                        >
                            Filter by Price
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            px: 1,
                            py: 1.5,
                            borderRadius: "16px",
                            backgroundColor: "background.default",
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Slider
                            value={priceRange}
                            onChange={(e, newValue) => setPriceRange(newValue)}
                            valueLabelDisplay="auto"
                            min={0}
                            max={100000}
                            sx={{
                                color: "primary.main",
                                "& .MuiSlider-thumb": {
                                    width: 18,
                                    height: 18,
                                    boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                                },
                                "& .MuiSlider-rail": {
                                    opacity: 0.35,
                                },
                                "& .MuiSlider-track": {
                                    border: "none",
                                },
                            }}
                        />

                        <Box
                            sx={{
                                mt: 1.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    flex: 1,
                                    px: 1,
                                    py: 0.8,
                                    borderRadius: "10px",
                                    backgroundColor: "background.paper",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    textAlign: "center"
                                }}
                            >
                                <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 700, textTransform: "uppercase", mb: 0.2 }}>From</Typography>
                                <Typography sx={{ color: "text.primary", fontWeight: 800, fontSize: "0.85rem" }}>
                                    EGP {priceRange[0]}
                                </Typography>
                            </Box>

                            <Typography sx={{ color: "text.secondary", fontSize: "0.8rem", fontWeight: 700 }}>—</Typography>

                            <Box
                                sx={{
                                    flex: 1,
                                    px: 1,
                                    py: 0.8,
                                    borderRadius: "10px",
                                    backgroundColor: "background.paper",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    textAlign: "center"
                                }}
                            >
                                <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 700, textTransform: "uppercase", mb: 0.2 }}>To</Typography>
                                <Typography sx={{ color: "text.primary", fontWeight: 800, fontSize: "0.85rem" }}>
                                    EGP {priceRange[1]}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Condition */}
                <Box
                    sx={{
                        p: 1.6,
                        borderRadius: "18px",
                        backgroundColor: "background.subtle",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                        <VerifiedOutlinedIcon sx={{ color: "secondary.main", fontSize: 20 }} />
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: "text.primary",
                                fontSize: "0.98rem",
                            }}
                        >
                            Condition
                        </Typography>
                    </Box>

                    <FormControl component="fieldset" fullWidth>
                        <FormGroup
                            sx={{
                                gap: 0.5,
                                p: 1.2,
                                borderRadius: "16px",
                                backgroundColor: "background.default",
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedConditions.includes("New")}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedConditions([...selectedConditions, "New"]);
                                            } else {
                                                setSelectedConditions(selectedConditions.filter((c) => c !== "New"));
                                            }
                                        }}
                                        sx={{
                                            color: "text.secondary",
                                            "&.Mui-checked": {
                                                color: "primary.main",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                                        New
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedConditions.includes("Like New")}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedConditions([...selectedConditions, "Like New"]);
                                            } else {
                                                setSelectedConditions(selectedConditions.filter((c) => c !== "Like New"));
                                            }
                                        }}
                                        sx={{
                                            color: "#94a3b8",
                                            "&.Mui-checked": {
                                                color: "#2563eb",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                                        Like New
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedConditions.includes("Good")}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedConditions([...selectedConditions, "Good"]);
                                            } else {
                                                setSelectedConditions(selectedConditions.filter((c) => c !== "Good"));
                                            }
                                        }}
                                        sx={{
                                            color: "#94a3b8",
                                            "&.Mui-checked": {
                                                color: "#2563eb",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                                        Good
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedConditions.includes("Fair")}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedConditions([...selectedConditions, "Fair"]);
                                            } else {
                                                setSelectedConditions(selectedConditions.filter((c) => c !== "Fair"));
                                            }
                                        }}
                                        sx={{
                                            color: "#94a3b8",
                                            "&.Mui-checked": {
                                                color: "#2563eb",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                                        Fair
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedConditions.includes("Poor")}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedConditions([...selectedConditions, "Poor"]);
                                            } else {
                                                setSelectedConditions(selectedConditions.filter((c) => c !== "Poor"));
                                            }
                                        }}
                                        sx={{
                                            color: "#94a3b8",
                                            "&.Mui-checked": {
                                                color: "#2563eb",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                                        Poor
                                    </Typography>
                                }
                            />
                        </FormGroup>
                    </FormControl>
                </Box>

                {/* Small Helper Box */}
                <Box
                    sx={{
                        mt: 3,
                        p: 1.8,
                        borderRadius: "18px",
                        backgroundColor: "background.subtle",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
                        <TuneRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography
                            sx={{
                                fontWeight: 800,
                                fontSize: "0.92rem",
                                color: "text.primary",
                            }}
                        >
                            Quick Tip
                        </Typography>
                    </Box>

                    <Typography
                        sx={{
                            fontSize: "0.85rem",
                            color: "text.secondary",
                            lineHeight: 1.6,
                        }}
                    >
                        Narrow your results using filters to find the best student deals
                        faster.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}