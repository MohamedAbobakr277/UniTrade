import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import { useState } from "react";

export default function UsersTable({
  users,
  listings = [],
  onViewUser
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const email = (u.universityEmail || u.email || "").toLowerCase();
    const uni = (u.university || "").toLowerCase();

    return name.includes(term) || email.includes(term) || uni.includes(term);
  });

  return (
    <Box sx={{ animation: "fadeIn 0.5s ease" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Registered Students
        </Typography>

        <TextField
          size="small"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            bgcolor: "background.paper",
            width: 300,
            overflow: "hidden",
            "& .MuiOutlinedInput-root": {
              borderRadius: "6px",
              overflow: "hidden"
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)"
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper
        sx={{
          borderRadius: "6px",
          overflow: "hidden",
          boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, py: 1.5 }}>NAME</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>UNIVERSITY</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>RATING</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>LISTINGS</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>EMAIL VERIFIED</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No users found matching "{searchQuery}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell sx={{ py: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          src={user.photoURL}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "primary.main",
                            fontSize: "1rem",
                            fontWeight: 700,
                          }}
                        >
                          {(user.firstName || user.name || "U").charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontWeight: 700 }}>
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.name ?? "—"}
                            </Typography>
                            {user.role === "admin" && (
                              <Chip label="Admin" size="small" sx={{ height: 18, fontSize: "0.6rem", bgcolor: isDark ? "rgba(37, 99, 235, 0.15)" : "#eff6ff", color: isDark ? "#60a5fa" : "#2563eb", fontWeight: 700 }} />
                            )}
                            {user.isBanned && (
                              <Chip label="Banned" size="small" sx={{ height: 18, fontSize: "0.6rem", bgcolor: isDark ? "rgba(239, 68, 68, 0.15)" : "#fef2f2", color: isDark ? "#f87171" : "#ef4444", fontWeight: 700 }} />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {user.universityEmail ?? user.email ?? ""}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.university ?? "—"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <StarIcon sx={{ color: "#f59e0b", fontSize: "1.1rem" }} />
                        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                          {user.averageRating ? user.averageRating.toFixed(1) : "0.0"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({user.ratingsCount || 0})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={listings.filter(l => l.userId === user.id).length}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: "background.subtle" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.emailVerified ? "Verified" : "Pending"}
                        color={user.emailVerified ? "success" : "warning"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          height: 24,
                          bgcolor: user.emailVerified
                            ? (isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5")
                            : (isDark ? "rgba(245, 158, 11, 0.15)" : "#fffbeb"),
                          color: user.emailVerified
                            ? (isDark ? "#34d399" : "#10b981")
                            : (isDark ? "#fbbf24" : "#f59e0b"),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1 }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => onViewUser(user)}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                      >
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
