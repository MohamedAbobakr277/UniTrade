import { useState, useEffect } from "react";
import { Box, Typography, Rating, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { submitRating, getUserRatingForSeller } from "../services/ratings";

export default function StarRatingInput({ sellerId, currentUser }) {
    const [rating, setRating] = useState(0);
    const [initialRating, setInitialRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        const fetchRating = async () => {
            if (currentUser && sellerId) {
                const userRating = await getUserRatingForSeller(sellerId, currentUser.uid);
                if (userRating) {
                    setRating(userRating);
                    setInitialRating(userRating);
                }
            }
            setFetching(false);
        };
        fetchRating();
    }, [sellerId, currentUser]);

    const handleSubmit = async () => {
        if (!currentUser) {
            setSnackbar({ open: true, message: "You must be logged in to rate.", severity: "error" });
            return;
        }
        if (rating < 1 || rating > 5) {
            setSnackbar({ open: true, message: "Please select a valid rating.", severity: "warning" });
            return;
        }

        setLoading(true);
        try {
            await submitRating(sellerId, currentUser.uid, rating);
            setInitialRating(rating);
            setSnackbar({ open: true, message: "Rating submitted successfully!", severity: "success" });
            // Note: In a real app we might want to refresh the seller data on the parent component
            // so the average rating updates immediately without page reload.
        } catch (error) {
            console.error("Failed to submit rating:", error);
            setSnackbar({ open: true, message: error.message || "Failed to submit rating.", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const hasChanged = rating !== initialRating && rating > 0;

    if (fetching) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            p: 3, 
            borderRadius: "16px", 
            border: "1px solid",
            borderColor: "divider", 
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            boxShadow: (theme) => theme.palette.mode === 'light' ? "0 4px 12px rgba(0,0,0,0.02)" : "none"
        }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>
                {initialRating > 0 ? "Update your rating" : "Rate this seller"}
            </Typography>
            
            <Rating
                value={rating}
                onChange={(event, newValue) => {
                    setRating(newValue);
                }}
                size="large"
                sx={{
                    color: "#faaf00",
                    fontSize: "2.5rem"
                }}
            />
            
            <Button
                variant="contained"
                disabled={!hasChanged || loading}
                onClick={handleSubmit}
                sx={{
                    mt: 1,
                    borderRadius: "12px",
                    px: 4,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "#2563eb",
                    "&:hover": {
                        bgcolor: "#1d4ed8",
                    },
                    "&:disabled": {
                        bgcolor: "background.subtle",
                        color: "text.disabled",
                        border: "1px solid",
                        borderColor: "divider"
                    }
                }}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
            </Button>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: "12px", fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
