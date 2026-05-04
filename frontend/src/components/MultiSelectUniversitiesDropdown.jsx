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
                    backgroundColor: "#f8fafc",
                    border: isOpen ? "1px solid #2563eb" : "1px solid #dbe3ee",
                    color: "#334155",
                    fontWeight: 600,
                    textTransform: "none",
                    px: 2,
                    py: 1,
                    "&:hover": {
                        backgroundColor: "#f1f5f9",
                        borderColor: "#2563eb",
                    },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {selectedUniversities.length === 0 ? "All Universities" : `${selectedUniversities.length} Selected`}
                    </Typography>
                    {selectedUniversities.length > 0 && (
                        <Typography
                            component="span"
                            onClick={handleClear}
                            sx={{
                                fontSize: "0.75rem",
                                color: "#ef4444",
                                bgcolor: "#fee2e2",
                                px: 1,
                                borderRadius: "8px",
                                ml: 1,
                                "&:hover": { bgcolor: "#fecaca" }
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
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        maxHeight: "250px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: "6px" },
                        "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "10px" },
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
                                            color: "#cbd5e1",
                                            "&.Mui-checked": { color: "#2563eb" },
                                        }}
                                    />
                                }
                                label={<Typography sx={{ fontSize: "0.9rem", color: "#334155", fontWeight: 500 }}>{uni}</Typography>}
                                sx={{ mb: 0.5 }}
                            />
                        ))}
                    </FormGroup>
                </Box>
            </Collapse>
        </Box>
    );
}
