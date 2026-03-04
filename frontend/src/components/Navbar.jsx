import { AppBar, Toolbar, Box, IconButton, Avatar } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import logo from "../assets/logo.png";

export default function Navbar() {
    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: "#f5f6f8",
                borderBottom: "1px solid #e0e0e0",
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 5 }}>
                {/* LOGO */}
                <img
                    src={logo}
                    alt="UniTrade"
                    style={{ height: "36px" }}
                />

                {/* RIGHT ICONS */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <IconButton>
                        <NotificationsNoneIcon sx={{ color: "#333" }} />
                    </IconButton>
                    <Avatar src="https://i.pravatar.cc/40" />
                </Box>
            </Toolbar>
        </AppBar>
    );
}