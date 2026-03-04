import { Box, Chip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalculateIcon from "@mui/icons-material/Calculate";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import BuildIcon from "@mui/icons-material/Build";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useState } from "react";

export default function CategoryBar() {
    const [active, setActive] = useState("All");

    const categories = [
        {
            label: "All",
            icon: <HomeIcon />,
            iconColor: "#2563eb",
        },
        {
            label: "Books & Notes",
            icon: <MenuBookIcon />,
            iconColor: "#f59e0b",
        },
        {
            label: "Calculators",
            icon: <CalculateIcon />,
            iconColor: "#10b981",
        },
        {
            label: "Laptops & Tablets",
            icon: <LaptopMacIcon />,
            iconColor: "#8b5cf6",
        },
        {
            label: "Engineering Tools",
            icon: <BuildIcon />,
            iconColor: "#3b82f6",
        },
        {
            label: "Medical Tools",
            icon: <MedicalServicesIcon />,
            iconColor: "#2563eb",
        },
    ];

    return (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                mb: 4,
                flexWrap: "wrap",
            }}
        >
            {categories.map((cat) => (
                <Chip
                    key={cat.label}
                    label={cat.label}
                    icon={cat.icon}
                    onClick={() => setActive(cat.label)}
                    sx={{
                        px: 2,
                        py: 2.5,
                        fontWeight: 500,
                        borderRadius: 3,
                        backgroundColor:
                            active === cat.label ? "#2563eb" : "#f1f5f9",
                        color:
                            active === cat.label ? "white" : "black",
                        transition: "0.2s ease",
                        "& .MuiChip-icon": {
                            color:
                                active === cat.label
                                    ? "white"
                                    : cat.iconColor,
                        },
                        "&:hover": {
                            backgroundColor:
                                active === cat.label
                                    ? "#1e40af"
                                    : "#e2e8f0",
                        },
                    }}
                />
            ))}
        </Box>
    );
}