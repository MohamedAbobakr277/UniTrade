import { db } from "../../../firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

export function subscribeToProducts(callback) {
  return onSnapshot(collection(db, "products"), (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToUsers(callback) {
  return onSnapshot(collection(db, "users"), (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function updateProduct(id, fields) {
  await updateDoc(doc(db, "products", id), {
    title:       fields.title,
    description: fields.description,
    category:    fields.category,
    price:       Number(fields.price),
    condition:   fields.condition,
    status:      fields.status,
  });
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

export async function addProduct(fields) {
  await addDoc(collection(db, "products"), {
    ...fields,
    user: "Admin",
    status: "available",
    createdAt: new Date(),
  });
}

export async function updateUser(id, fields) {
  await updateDoc(doc(db, "users", id), fields);
}

export async function deleteUser(id) {
  await deleteDoc(doc(db, "users", id));
}
