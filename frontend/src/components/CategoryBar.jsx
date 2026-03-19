import { Box, Chip, Typography, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalculateIcon from "@mui/icons-material/Calculate";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import BuildIcon from "@mui/icons-material/Build";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ScienceIcon from "@mui/icons-material/Science";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BackpackIcon from "@mui/icons-material/Backpack";

export default function CategoryBar({
    selectedCategory,
    setSelectedCategory,
}) {
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
            label: "Electronics",
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
        {
            label: "Lab Equipment",
            icon: <ScienceIcon />,
            iconColor: "#10b981",
        },
        {
            label: "Stationery",
            icon: <EditNoteIcon />,
            iconColor: "#f59e0b",
        }, {
            label: "Bags & Accessories",
            icon: <BackpackIcon />,
            iconColor: "#8b5cf6",
        },
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 1.5,
                p: { xs: 2, md: 2.5 },
                borderRadius: "22px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    mb: 2.5,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CategoryOutlinedIcon sx={{ color: "#2563eb" }} />
                    <Typography
                        sx={{
                            fontSize: "1.05rem",
                            fontWeight: 800,
                            color: "#0f172a",
                        }}
                    >
                        Browse Categories
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        fontSize: "0.9rem",
                        color: "#64748b",
                    }}
                >
                    Choose a category to explore student listings faster
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                }}
            >
                {categories.map((cat) => (
                    <Chip
                        key={cat.label}
                        label={cat.label}
                        icon={cat.icon}
                        onClick={() => setSelectedCategory(cat.label)}
                        sx={{
                            px: 1.8,
                            py: 2.7,
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            borderRadius: "14px",
                            border:
                                selectedCategory === cat.label
                                    ? "1px solid #2563eb"
                                    : "1px solid #e2e8f0",
                            background:
                                selectedCategory === cat.label
                                    ? "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)"
                                    : "#f8fafc",
                            color:
                                selectedCategory === cat.label ? "#ffffff" : "#0f172a",
                            boxShadow:
                                selectedCategory === cat.label
                                    ? "0 8px 18px rgba(37,99,235,0.22)"
                                    : "0 2px 8px rgba(15,23,42,0.03)",
                            transition: "all 0.25s ease",
                            cursor: "pointer",
                            "& .MuiChip-label": {
                                px: 0.5,
                            },
                            "& .MuiChip-icon": {
                                color:
                                    selectedCategory === cat.label
                                        ? "#ffffff"
                                        : cat.iconColor,
                                marginLeft: "6px",
                                marginRight: "6px",
                                fontSize: "1.1rem",
                            },
                            "&:hover": {
                                transform: "translateY(-2px)",
                                background:
                                    selectedCategory === cat.label
                                        ? "linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)"
                                        : "#eef4ff",
                                borderColor: "#2563eb",
                                boxShadow:
                                    selectedCategory === cat.label
                                        ? "0 10px 22px rgba(37,99,235,0.28)"
                                        : "0 6px 14px rgba(37,99,235,0.08)",
                            },
                        }}
                    />
                ))}
            </Box>
        </Paper>
    );
}