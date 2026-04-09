import { useState, useEffect } from "react";
import { subscribeToUsers, updateUser, deleteUser } from "../services/admin.service";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    return subscribeToUsers(setUsers);
  }, []);

  const openUserDetail   = (user) => setSelectedUser(user);
  const closeUserDetail  = () => setSelectedUser(null);

  const toggleBanStatus = async (user) => {
    try {
      await updateUser(user.id, { isBanned: !user.isBanned });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isBanned: !user.isBanned } : u));
      if (selectedUser?.id === user.id) setSelectedUser({ ...selectedUser, isBanned: !user.isBanned });
    } catch (err) {
      console.error("Error toggling ban:", err);
    }
  };

  const toggleAdminRole = async (user) => {
    try {
      // Prevent demoting the last admin
      if (user.role === "admin") {
        const adminCount = users.filter((u) => u.role === "admin").length;
        if (adminCount <= 1) {
          alert("Cannot demote the last admin. Promote another user to admin first.");
          return;
        }
      }

      const newRole = user.role === "admin" ? "student" : "admin";
      await updateUser(user.id, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
      if (selectedUser?.id === user.id) setSelectedUser({ ...selectedUser, role: newRole });
    } catch (err) {
      console.error("Error toggling role:", err);
    }
  };

  const confirmDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to permanently delete user ${user.firstName || user.name}?`)) {
      try {
        await deleteUser(user.id);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        if (selectedUser?.id === user.id) setSelectedUser(null);
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  return { 
    users, 
    selectedUser, 
    openUserDetail, 
    closeUserDetail,
    toggleBanStatus,
    toggleAdminRole,
    confirmDeleteUser
  };
}
