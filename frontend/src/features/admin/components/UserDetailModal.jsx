import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon          from "@mui/icons-material/Close";
import SchoolIcon         from "@mui/icons-material/School";
import EmailIcon          from "@mui/icons-material/Email";
import PhoneIcon          from "@mui/icons-material/Phone";
import BlockIcon          from "@mui/icons-material/Block";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DeleteIcon         from "@mui/icons-material/Delete";
import PersonIcon         from "@mui/icons-material/Person";

export default function UserDetailModal({ 
  user,
  listings = [],
  onClose, 
  onToggleBan, 
  onToggleRole, 
  onDelete 
}) {
  if (!user) return null;

  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.name ?? "Unknown User";

  const isBanned = !!user.isBanned;
  const isAdmin = user.role === "admin";

  const userListings = listings.filter(l => 
    l.userId === user.id || 
    l.user === user.id || 
    l.sellerName === fullName ||
    l.user === fullName // fallback for older data
  );

  const activeItems = userListings.filter(l => l.status !== "sold").length;
  const soldItems   = userListings.filter(l => l.status === "sold").length;

  return (
    <Dialog
      open={!!user}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden", fontFamily: "'Outfit', sans-serif" }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* ── Header ── */}
        <Box sx={{ position: "relative", bgcolor: "#f8fafc", p: 4, textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ position: "absolute", top: 12, right: 12 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Avatar
            src={user.photoURL}
            sx={{ width: 80, height: 80, mx: "auto", mb: 2, bgcolor: "#2563eb", fontSize: "2rem", fontWeight: 700 }}
          >
            {fullName.charAt(0).toUpperCase()}
          </Avatar>
          
          <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", color: "#0f172a" }}>
            {fullName}
          </Typography>
          
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
            {isAdmin && <Chip label="Admin" size="small" color="primary" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />}
            {isBanned && <Chip label="Banned" size="small" color="error" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />}
            <Chip 
              label={user.emailVerified ? "Verified" : "Unverified"} 
              size="small" 
              color={user.emailVerified ? "success" : "default"} 
              sx={{ fontWeight: 700, fontSize: "0.7rem" }} 
            />
          </Box>
        </Box>

        {/* ── Details ── */}
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <EmailIcon sx={{ color: "#94a3b8" }} />
              <Box>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>University Email</Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                  {user.universityEmail ?? user.email ?? "—"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <SchoolIcon sx={{ color: "#94a3b8" }} />
              <Box>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>University & Faculty</Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                  {user.university ?? "—"} • {user.faculty ?? "—"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PhoneIcon sx={{ color: "#94a3b8" }} />
              <Box>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Phone Number</Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                  {user.phoneNumber ?? "—"}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />

          {/* ── User Listings Stats & Mini List ── */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                User's Listings
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                {activeItems} Active • {soldItems} Sold
              </Typography>
            </Box>
            
            {userListings.length === 0 ? (
              <Box sx={{ p: 2, bgcolor: "#f1f5f9", borderRadius: 2, textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>No listings found for this user.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 180, overflowY: "auto", pr: 1 }}>
                {userListings.map(item => (
                  <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                    <Avatar src={item.images?.[0]} variant="rounded" sx={{ width: 36, height: 36 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700 }}>
                        {Number(item.price ?? 0).toLocaleString()} EGP
                      </Typography>
                    </Box>
                    <Chip 
                      label={item.status === "sold" ? "Sold" : "Active"} 
                      size="small" 
                      sx={{ 
                        height: 20, fontSize: "0.6rem", fontWeight: 700, 
                        bgcolor: item.status === "sold" ? "#fef2f2" : "#ecfdf5", 
                        color: item.status === "sold" ? "#ef4444" : "#10b981" 
                      }} 
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* ── Admin Actions ── */}
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", mb: 2 }}>
            Danger Zone
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant={isBanned ? "contained" : "outlined"}
              color={isBanned ? "success" : "warning"}
              startIcon={<BlockIcon />}
              onClick={() => onToggleBan(user)}
              sx={{ flex: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              {isBanned ? "Unban" : "Ban User"}
            </Button>

            <Button
              variant={isAdmin ? "outlined" : "contained"}
              color="primary"
              startIcon={isAdmin ? <PersonIcon /> : <AdminPanelSettingsIcon />}
              onClick={() => onToggleRole(user)}
              sx={{ flex: 1, bgcolor: isAdmin ? "transparent" : "#2563eb", textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              {isAdmin ? "Demote" : "Make Admin"}
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(user)}
              sx={{ flex: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
