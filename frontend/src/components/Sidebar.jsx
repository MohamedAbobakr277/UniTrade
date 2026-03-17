import {
    Box,
    Typography,
    Button,
    Select,
    MenuItem,
    Slider,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Divider,
    Paper,
    InputLabel,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
    const [price, setPrice] = useState([0, 7000]);
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                width: { xs: "100%", md: 280 },
                p: { xs: 2, md: 2 },
                minHeight: "100vh",
                background:
                    "linear-gradient(180deg, #f8fbff 0%, #f8fafc 45%, #f1f5f9 100%)",
                borderRight: { xs: "none", md: "1px solid #e2e8f0" },
                boxShadow: { xs: "none", md: "6px 0 24px rgba(15,23,42,0.04)" },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    borderRadius: "24px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.05)",
                    position: "sticky",
                    top: 20,
                }}
            >
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <StorefrontOutlinedIcon sx={{ color: "#2563eb" }} />
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: "#0f172a",
                            fontSize: "1.1rem",
                        }}
                    >
                        Categories
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        color: "#64748b",
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
                        background: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
                        boxShadow: "0 10px 20px rgba(37,99,235,0.25)",
                        "&:hover": {
                            background: "linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)",
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
                        backgroundColor: "#fcfdff",
                        border: "1px solid #edf2f7",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                        <SchoolOutlinedIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: "#0f172a",
                                fontSize: "0.98rem",
                            }}
                        >
                            Filter by University
                        </Typography>
                    </Box>

                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: "#64748b" }}>University</InputLabel>
                        <Select
                            defaultValue="All Universities"
                            label="University"
                            sx={{
                                borderRadius: "14px",
                                backgroundColor: "#f8fafc",
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#dbe3ee",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#2563eb",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#2563eb",
                                },
                            }}
                        >
                            <MenuItem value="All Universities">All Universities</MenuItem>
                            <MenuItem value="Cairo University">Cairo University</MenuItem>
                            <MenuItem value="Ain Shams">Ain Shams University</MenuItem>
                            <MenuItem value="Ain Shams">Helwan University</MenuItem>
                            <MenuItem value="Ain Shams">Menofia University</MenuItem>
                            <MenuItem value="Ain Shams">Fayoum University</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Filter by Price */}
                <Box
                    sx={{
                        mb: 3,
                        p: 1.6,
                        borderRadius: "18px",
                        backgroundColor: "#fcfdff",
                        border: "1px solid #edf2f7",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <PaidOutlinedIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: "#0f172a",
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
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <Slider
                            value={price}
                            onChange={(e, newValue) => setPrice(newValue)}
                            valueLabelDisplay="auto"
                            min={0}
                            max={7000}
                            sx={{
                                color: "#2563eb",
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
                                mt: 1.2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap",
                            }}
                        >
                            <Box
                                sx={{
                                    px: 1.2,
                                    py: 0.7,
                                    borderRadius: "10px",
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: "#334155",
                                        fontWeight: 700,
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    EGP {price[0]}
                                </Typography>
                            </Box>

                            <Typography
                                sx={{
                                    color: "#94a3b8",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                }}
                            >
                                to
                            </Typography>

                            <Box
                                sx={{
                                    px: 1.2,
                                    py: 0.7,
                                    borderRadius: "10px",
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: "#334155",
                                        fontWeight: 700,
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    EGP {price[1]}
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
                        backgroundColor: "#fcfdff",
                        border: "1px solid #edf2f7",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                        <VerifiedOutlinedIcon sx={{ color: "#7c3aed", fontSize: 20 }} />
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: "#0f172a",
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
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        sx={{
                                            color: "#94a3b8",
                                            "&.Mui-checked": {
                                                color: "#2563eb",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 600, color: "#334155" }}>
                                        New
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        sx={{
                                            color: "#94a3b8",
                                            "&.Mui-checked": {
                                                color: "#2563eb",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 600, color: "#334155" }}>
                                        Like New
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        sx={{
                                            color: "#94a3b8",
                                            "&.Mui-checked": {
                                                color: "#2563eb",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 600, color: "#334155" }}>
                                        Good
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
                        background: "linear-gradient(135deg, #eef4ff 0%, #f8fbff 100%)",
                        border: "1px solid #dbeafe",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
                        <TuneRoundedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                        <Typography
                            sx={{
                                fontWeight: 800,
                                fontSize: "0.92rem",
                                color: "#0f172a",
                            }}
                        >
                            Quick Tip
                        </Typography>
                    </Box>

                    <Typography
                        sx={{
                            fontSize: "0.85rem",
                            color: "#64748b",
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