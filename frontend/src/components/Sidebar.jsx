import {
    Box,
    Typography,
    Button,
    Select,
    MenuItem,
    Slider,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
    const [price, setPrice] = useState([0, 7000]);
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                width: 260,
                p: 3,
                backgroundColor: "#f8fafc",
                borderRight: "1px solid #eee",
                boxShadow: "2px 0 20px rgba(0,0,0,0.03)",
                minHeight: "100vh",
            }}
        >
            {/* Categories Title */}
            <Typography variant="h6" sx={{ mb: 2 }}>
                Categories
            </Typography>

            {/* Sell Button */}
            <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/sell")}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    background: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
                }}
            >
                SELL YOUR ITEM
            </Button>

            {/* Filter by University */}
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Filter by University
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
                <Select defaultValue="All Universities">
                    <MenuItem value="All Universities">
                        All Universities
                    </MenuItem>
                    <MenuItem value="Cairo University">
                        Cairo University
                    </MenuItem>
                    <MenuItem value="Ain Shams">
                        Ain Shams
                    </MenuItem>
                </Select>
            </FormControl>

            {/* Filter by Price */}
            <Typography sx={{ fontWeight: 600, mb: 2 }}>
                Filter by Price
            </Typography>

            <Slider
                value={price}
                onChange={(e, newValue) => setPrice(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={7000}
            />

            <Typography sx={{ mt: 1, mb: 3, color: "gray" }}>
                EGP {price[0]} — EGP {price[1]}
            </Typography>

            {/* Condition */}
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Condition
            </Typography>

            <FormControl component="fieldset">
                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox />}
                        label="New"
                    />
                    <FormControlLabel
                        control={<Checkbox />}
                        label="Like New"
                    />
                    <FormControlLabel
                        control={<Checkbox />}
                        label="Good"
                    />
                </FormGroup>
            </FormControl>
        </Box>
    );
}