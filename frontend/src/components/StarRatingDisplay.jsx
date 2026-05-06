import { Box, Typography, Rating } from "@mui/material";

export default function StarRatingDisplay({ averageRating, ratingsCount, size = "small", showCount = true }) {
    const avg = averageRating || 0;
    const count = ratingsCount || 0;

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {count > 0 ? (
                <>
                    <Rating
                        value={avg}
                        precision={0.1}
                        readOnly
                        size={size}
                        sx={{ color: "#faaf00" }}
                    />
                    {showCount && (
                        <Typography sx={{ fontSize: size === "small" ? 13 : 15, color: "text.primary", fontWeight: 700 }}>
                            {avg.toFixed(1)} / 5
                            <Box component="span" sx={{ color: "text.secondary", ml: 1, fontWeight: 500 }}>
                                ({count} {count === 1 ? 'review' : 'reviews'})
                            </Box>
                        </Typography>
                    )}
                </>
            ) : (
                <Typography sx={{ fontSize: size === "small" ? 13 : 14, color: "text.secondary", fontWeight: 600, fontStyle: "italic" }}>
                    No ratings yet
                </Typography>
            )}
        </Box>
    );
}
