import { AppBar, Toolbar, Box, IconButton, Avatar } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";


export default function Navbar() {
    const navigate = useNavigate();
    const [editData, setEditData] = useState(null);
    useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      setEditData(userSnap.exists() ? userSnap.data() : {});
    };

    fetchUserData();
  }, [auth.currentUser]);

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
                    style={{ height: "80px" }}
                />

                {/* RIGHT ICONS */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <IconButton>
                        <NotificationsNoneIcon sx={{ color: "#333" }} />
                    </IconButton>

                    <Avatar src={editData?.profilePhoto || "/default-avatar.png"}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate("/profile")}
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
}