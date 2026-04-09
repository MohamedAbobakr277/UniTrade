import {
    Box,
    TextField,
    InputAdornment,
    Button,
    Typography,
    Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

export default function TopSection({ search, setSearch }) {
    return (
        <Paper
            elevation={0}
            sx={{
                px: { xs: 2, md: 5 },
                py: { xs: 2, md: 2.5 },
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                borderRadius: 0,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: { xs: "stretch", md: "center" },
                    gap: 2.5,
                    flexDirection: { xs: "column", md: "row" },
                }}
            >
                {/* HOME BUTTON */}
                <Button
                    variant="contained"
                    startIcon={<HomeRoundedIcon />}
                    sx={{
                        background: "linear-gradient(90deg,#4e73df,#2e59d9)",
                        borderRadius: "16px",
                        px: 3.5,
                        py: 1.4,
                        minWidth: "140px",
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        boxShadow: "0 10px 22px rgba(46,89,217,0.22)",
                        "&:hover": {
                            background: "linear-gradient(90deg,#3f66d6,#1f4fd0)",
                            boxShadow: "0 14px 26px rgba(46,89,217,0.28)",
                            transform: "translateY(-1px)",
                        },
                    }}
                >
                    Home
                </Button>

                {/* SEARCH AREA */}
                <Box
                    sx={{
                        display: "flex",
                        flex: 1,
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                    }}
                >
                    <TextField
                        fullWidth
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for items..."
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "16px",
                                backgroundColor: "#ffffff",
                                minHeight: "56px",
                                boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
                                "& fieldset": {
                                    borderColor: "#dbe3ee",
                                },
                                "&:hover fieldset": {
                                    borderColor: "#2563eb",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#2563eb",
                                },
                            },
                            "& input": {
                                fontSize: "0.98rem",
                                color: "#0f172a",
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "#94a3b8" }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#2e7d32",
                            borderRadius: "16px",
                            px: 4,
                            minWidth: { xs: "100%", sm: "130px" },
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            boxShadow: "0 10px 22px rgba(46,125,50,0.20)",
                            "&:hover": {
                                backgroundColor: "#256b2a",
                                boxShadow: "0 14px 26px rgba(46,125,50,0.28)",
                                transform: "translateY(-1px)",
                            },
                        }}
                    >
                        Search
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}