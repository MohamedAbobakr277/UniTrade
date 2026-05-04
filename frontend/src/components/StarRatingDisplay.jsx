import { Box, Typography, Rating } from "@mui/material";

export default function StarRatingDisplay({ averageRating, ratingsCount, size = "small", showCount = true }) {
    const avg = averageRating || 0;
    const count = ratingsCount || 0;

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Rating
                value={avg}
                precision={0.1}
                readOnly
                size={size}
                sx={{
                    color: "#faaf00", // Standard star color
                }}
            />
            {showCount && (
                <Typography sx={{ fontSize: size === "small" ? 13 : 15, color: "#64748b", fontWeight: 600, ml: 0.5 }}>
                    {avg.toFixed(1)} ({count})
                </Typography>
            )}
        </Box>
    );
}
