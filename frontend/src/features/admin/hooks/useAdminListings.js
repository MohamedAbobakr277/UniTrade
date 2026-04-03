import { useState, useEffect } from "react";
import {
  subscribeToProducts,
  updateProduct,
  deleteProduct,
  addProduct,
} from "../services/admin.service";

export function useAdminListings() {
  const [listings, setListings] = useState([]);

  // Modal states
  const [editTarget, setEditTarget] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    return subscribeToProducts(setListings);
  }, []);

  const openEdit = (item) => setEditTarget(item);
  const closeEdit = () => setEditTarget(null);

  const saveEdit = async (fields) => {
    await updateProduct(editTarget.id, {
      title: fields.title,
      description: fields.description,
      category: fields.category,
      price: Number(fields.price),
    });
    closeEdit();
  };

  const openAdd = () => setAddOpen(true);
  const closeAdd = () => setAddOpen(false);

  const saveAdd = async (fields) => {
    await addProduct({
      title: fields.title,
      description: fields.description,
      category: fields.category,
      condition: fields.condition,
      price: Number(fields.price),
    });
    closeAdd();
  };

  const openDelete = (item) => setDeleteTarget(item);
  const closeDelete = () => setDeleteTarget(null);

  const confirmDelete = async () => {
    await deleteProduct(deleteTarget.id);
    closeDelete();
  };

  return {
    listings,
    // edit
    editTarget,
    openEdit,
    closeEdit,
    saveEdit,
    // add
    addOpen,
    openAdd,
    closeAdd,
    saveAdd,
    // delete
    deleteTarget,
    openDelete,
    closeDelete,
    confirmDelete,
  };
}
