import { useState, useEffect } from "react";
import { Box } from "@mui/material";

import AdminHeader from "../features/admin/components/AdminHeader";
import AdminSidebar from "../features/admin/components/AdminSidebar";
import DashboardOverview from "../features/admin/components/DashboardOverview";
import ListingsTable from "../features/admin/components/ListingsTable";
import UsersTable from "../features/admin/components/UsersTable";
import EditListingModal from "../features/admin/components/EditListingModal";
import DeleteConfirmModal from "../features/admin/components/DeleteConfirmModal";
import UserDetailModal from "../features/admin/components/UserDetailModal";

import { useAdminListings } from "../features/admin/hooks/useAdminListings";
import { useAdminUsers } from "../features/admin/hooks/useAdminUsers";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const {
    listings,
    editTarget, openEdit, closeEdit, saveEdit,
    deleteTarget, openDelete, closeDelete, confirmDelete,
  } = useAdminListings();

  const {
    users,
    selectedUser,
    openUserDetail,
    closeUserDetail,
    toggleBanStatus,
    toggleAdminRole,
    confirmDeleteUser
  } = useAdminUsers();

  // Temporary migration to fix old database records:
  // If a user in the database doesn't have the explicit emailVerified boolean, Set it to true.
  useEffect(() => {
    users.forEach(async (u) => {
      if (u.emailVerified === undefined) {
        try {
          // Import updateUser directly from service to avoid hook circular deps
          const { updateUser } = await import("../features/admin/services/admin.service");
          await updateUser(u.id, { emailVerified: true });
        } catch (e) {
          console.log("Migration skip:", e);
        }
      }
    });
  }, [users]);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: "background.default" }}>
      {/* ── Sidebar ── */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      {/* ── Content column ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <AdminHeader activeTab={activeTab} />

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: "auto" }}>
          {activeTab === "dashboard" && (
            <DashboardOverview
              listings={listings}
              users={users}
              onViewAll={() => setActiveTab("listings")}
            />
          )}
          {activeTab === "listings" && (
            <ListingsTable
              listings={listings}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          )}
          {activeTab === "users" && (
            <UsersTable
              users={users}
              listings={listings}
              onViewUser={openUserDetail}
            />
          )}
        </Box>
      </Box>

      {/* ── Modals ── */}
      <EditListingModal item={editTarget} onClose={closeEdit} onSave={saveEdit} />
      <DeleteConfirmModal item={deleteTarget} onClose={closeDelete} onConfirm={confirmDelete} />
      <UserDetailModal
        user={selectedUser}
        listings={listings}
        onClose={closeUserDetail}
        onToggleBan={toggleBanStatus}
        onToggleRole={toggleAdminRole}
        onDelete={confirmDeleteUser}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}