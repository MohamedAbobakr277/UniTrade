import {
    Box,
    TextField,
    InputAdornment,
    Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function TopSection() {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                px: 5,
                py: 3,
                backgroundColor: "#f5f6f8",
                borderBottom: "1px solid #e0e0e0",
            }}
        >
            {/* HOME BUTTON */}
            <Button
                variant="contained"
                sx={{
                    background: "linear-gradient(90deg,#4e73df,#2e59d9)",
                    borderRadius: 3,
                    px: 4,
                    textTransform: "none",
                    fontWeight: 600,
                }}
            >
                ☰ Home
            </Button>

            {/* SEARCH BAR */}
            <Box sx={{ display: "flex", flex: 1, gap: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search for items..."
                    sx={{
                        backgroundColor: "white",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "gray" }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#2e7d32",
                        borderRadius: 2,
                        px: 4,
                        textTransform: "none",
                        fontWeight: 600,
                    }}
                >
                    Search
                </Button>
            </Box>
        </Box>
    );
}