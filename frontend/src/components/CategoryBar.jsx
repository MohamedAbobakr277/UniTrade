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
    selectedCategories = [],
    setSelectedCategories,
}) {
    const categories = [
        { label: "All", icon: <HomeIcon />, iconColor: "primary.main" },
        { label: "Books & Notes", icon: <MenuBookIcon />, iconColor: "warning.main" },
        { label: "Calculators", icon: <CalculateIcon />, iconColor: "success.main" },
        { label: "Electronics", icon: <LaptopMacIcon />, iconColor: "secondary.main" },
        { label: "Engineering Tools", icon: <BuildIcon />, iconColor: "primary.light" },
        { label: "Medical Tools", icon: <MedicalServicesIcon />, iconColor: "error.main" },
        { label: "Lab Equipment", icon: <ScienceIcon />, iconColor: "success.dark" },
        { label: "Stationery", icon: <EditNoteIcon />, iconColor: "warning.dark" }, 
        { label: "Bags & Accessories", icon: <BackpackIcon />, iconColor: "secondary.dark" },
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 1.5,
                p: { xs: 2, md: 2.5 },
                borderRadius: "22px",
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: (theme) => theme.palette.mode === 'light' ? "0 8px 30px rgba(15, 23, 42, 0.04)" : "none",
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
                            color: "text.primary",
                        }}
                    >
                        Browse Categories
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        fontSize: "0.9rem",
                        color: "text.secondary",
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
                {categories.map((cat) => {
                    const isSelected = cat.label === "All" 
                        ? selectedCategories.length === 0 
                        : selectedCategories.includes(cat.label);

                    const handleToggle = () => {
                        if (cat.label === "All") {
                            setSelectedCategories([]);
                        } else {
                            if (selectedCategories.includes(cat.label)) {
                                setSelectedCategories(selectedCategories.filter(c => c !== cat.label));
                            } else {
                                setSelectedCategories([...selectedCategories, cat.label]);
                            }
                        }
                    };

                    return (
                        <Chip
                            key={cat.label}
                            label={cat.label}
                            icon={cat.icon}
                            onClick={handleToggle}
                            sx={{
                                px: 1.8,
                                py: 2.7,
                                fontWeight: 800,
                                fontSize: "0.95rem",
                                borderRadius: "14px",
                                border: '1px solid',
                                borderColor: isSelected ? 'primary.main' : 'divider',
                                background: isSelected
                                    ? (theme) => theme.palette.mode === 'light' 
                                        ? "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)"
                                        : "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)"
                                    : (theme) => theme.palette.mode === 'light' ? "#f8fafc" : "rgba(255,255,255,0.03)",
                                color: isSelected ? "#ffffff" : "text.primary",
                                boxShadow: isSelected
                                    ? "0 8px 18px rgba(37,99,235,0.22)"
                                    : "0 2px 8px rgba(15,23,42,0.03)",
                                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                "& .MuiChip-label": { px: 0.5 },
                                "& .MuiChip-icon": {
                                    color: isSelected ? "#ffffff" : cat.iconColor,
                                    marginLeft: "6px",
                                    marginRight: "6px",
                                    fontSize: "1.1rem",
                                },
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    background: isSelected
                                        ? (theme) => theme.palette.mode === 'light' 
                                            ? "linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)"
                                            : "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)"
                                        : (theme) => theme.palette.mode === 'light' ? "#eef4ff" : "rgba(255,255,255,0.08)",
                                    borderColor: 'primary.main',
                                    boxShadow: isSelected
                                        ? "0 10px 22px rgba(37,99,235,0.28)"
                                        : "0 6px 14px rgba(37,99,235,0.08)",
                                },
                            }}
                        />
                    );
                })}
            </Box>
        </Paper>
    );
}