import { Box, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export default function TopSection({ search, setSearch }) {
    return (
        <Box
            sx={{
                px: { xs: 2, md: 5 },
                py: { xs: 2, md: 2.5 },
                background: "#ffffff",
                borderBottom: "1px solid #e8eef8",
            }}
        >
            {/* Search Bar */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    maxWidth: "720px",
                    mx: "auto",
                    borderRadius: "50px",
                    border: "1.5px solid #dbe6fb",
                    backgroundColor: "#f8faff",
                    boxShadow: "0 2px 16px rgba(37,99,235,0.06)",
                    px: 2.5,
                    py: 0.6,
                    gap: 1.5,
                    transition: "all 0.25s ease",
                    "&:focus-within": {
                        border: "1.5px solid #3b82f6",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 24px rgba(59,130,246,0.14)",
                    },
                }}
            >
                {/* Search Icon */}
                <SearchIcon
                    sx={{
                        color: search ? "#3b82f6" : "#94a3b8",
                        fontSize: "1.3rem",
                        flexShrink: 0,
                        transition: "color 0.2s",
                    }}
                />

                {/* Input */}
                <InputBase
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for books, electronics, furniture and more..."
                    inputProps={{ "aria-label": "search items" }}
                    sx={{
                        fontSize: "0.95rem",
                        color: "#0f172a",
                        fontWeight: 500,
                        py: 0.8,
                        "& input::placeholder": {
                            color: "#a0aec0",
                            fontWeight: 400,
                        },
                    }}
                />

                {/* Clear icon — only when typing */}
                {search && (
                    <ClearIcon
                        onClick={() => setSearch("")}
                        sx={{
                            color: "#94a3b8",
                            fontSize: "1.1rem",
                            flexShrink: 0,
                            cursor: "pointer",
                            borderRadius: "50%",
                            transition: "all 0.2s",
                            "&:hover": { color: "#475569", bgcolor: "#f1f5f9" },
                        }}
                    />
                )}
            </Box>
        </Box>
    );
}