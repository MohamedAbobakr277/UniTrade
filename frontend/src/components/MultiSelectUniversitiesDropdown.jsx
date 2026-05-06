import { useState, useRef, useEffect } from "react";
import {
    Box,
    Typography,
    Checkbox,
    FormGroup,
    FormControlLabel,
    Collapse,
    Button,
    Badge,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const standardUniversities = [
    "Cairo University", "Ain Shams University", "Alexandria University",
    "Mansoura University", "Assiut University", "Helwan University",
    "Tanta University", "Zagazig University", "Suez Canal University",
    "Al-Azhar University", "German University in Cairo", "British University in Egypt",
    "October 6 University", "Future University in Egypt", "AASTMT", "Nile University",
    "Others"
];

export default function MultiSelectUniversitiesDropdown({ selectedUniversities, setSelectedUniversities }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = (uni) => {
        if (selectedUniversities.includes(uni)) {
            setSelectedUniversities(selectedUniversities.filter((item) => item !== uni));
        } else {
            setSelectedUniversities([...selectedUniversities, uni]);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setSelectedUniversities([]);
    };

    return (
        <Box ref={containerRef} sx={{ width: "100%", position: "relative" }}>
            <Button
                disableRipple
                onClick={() => setIsOpen(!isOpen)}
                endIcon={isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    borderRadius: "14px",
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    borderColor: isOpen ? "primary.main" : "divider",
                    color: "text.primary",
                    fontWeight: 600,
                    textTransform: "none",
                    px: 2,
                    py: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                        backgroundColor: "background.subtle",
                        borderColor: "primary.main",
                    },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "text.primary" }}>
                        {selectedUniversities.length === 0 ? "All Universities" : `${selectedUniversities.length} Selected`}
                    </Typography>
                    {selectedUniversities.length > 0 && (
                        <Typography
                            component="span"
                            onClick={handleClear}
                            sx={{
                                fontSize: "0.72rem",
                                color: "#ef4444",
                                bgcolor: "rgba(239, 68, 68, 0.1)",
                                px: 1,
                                py: 0.2,
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                fontWeight: 700,
                                borderRadius: "6px",
                                ml: 1,
                                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" }
                            }}
                        >
                            Clear
                        </Typography>
                    )}
                </Box>
            </Button>

            <Collapse in={isOpen} sx={{ position: "absolute", width: "100%", zIndex: 10, mt: 0.5 }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: "14px",
                        backgroundColor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: (theme) => theme.palette.mode === 'light' ? "0 10px 25px rgba(0,0,0,0.05)" : "0 10px 30px rgba(0,0,0,0.3)",
                        maxHeight: "250px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: "6px" },
                        "&::-webkit-scrollbar-thumb": { 
                            background: (theme) => theme.palette.mode === 'light' ? "#cbd5e1" : "#334155", 
                            borderRadius: "10px" 
                        },
                    }}
                >
                    <FormGroup>
                        {standardUniversities.map((uni) => (
                            <FormControlLabel
                                key={uni}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={selectedUniversities.includes(uni)}
                                        onChange={() => handleToggle(uni)}
                                        sx={{
                                            color: "text.secondary",
                                            "&.Mui-checked": { color: "primary.main" },
                                        }}
                                    />
                                }
                                label={<Typography sx={{ fontSize: "0.9rem", color: "text.primary", fontWeight: 500 }}>{uni}</Typography>}
                                sx={{ mb: 0.5 }}
                            />
                        ))}
                    </FormGroup>
                </Box>
            </Collapse>
        </Box>
    );
}
