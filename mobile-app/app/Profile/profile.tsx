import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../services/firebase";
import { useTheme } from "../../constants/ThemeContext";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Stars } from "../../components/Stars";
import { useSellerRating } from "../services/rating";
import { ProductCard } from "@/components/ProductCard";

const CLOUD_NAME = "dstfo8pxq";
const UPLOAD_PRESET = "unitrade_upload";

const UNIVERSITIES = [
  "Cairo University", "Ain Shams University", "Alexandria University",
  "Mansoura University", "Assiut University", "Helwan University",
  "Tanta University", "Zagazig University", "Suez Canal University",
  "Al-Azhar University", "German University in Cairo",
  "British University in Egypt", "October 6 University",
  "Future University in Egypt", "AASTMT", "Nile University", "Others",
];

const FACULTIES = [
  "Computer Science", "Engineering", "Medicine", "Pharmacy", "Law",
  "Business Administration", "Dentistry", "Arts", "Science", "Nursing", "Others",
];

export default function Profile() {
  const { theme, toggleTheme, darkMode } = useTheme();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [editVisible, setEditVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [faculty, setFaculty] = useState("");
  const [university, setUniversity] = useState("");
  const [showUniversityList, setShowUniversityList] = useState(false);
  const [showFacultyList, setShowFacultyList] = useState(false);
  
  const { rating: sellerRating } = useSellerRating(auth.currentUser?.uid);

  /* ─── Load user (real-time) ─── */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setUser(d);
        setFirstName(d.firstName || "");
        setLastName(d.lastName || "");
        setPhone(d.phoneNumber || "");
        setFaculty(d.faculty || "");
        setUniversity(d.university || "");
      }
    });
    return unsub;
  }, []);

  /* ─── Load products ─── */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(collection(db, "products"), where("userId", "==", uid));
    return onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* ─── Delete product ─── */
  const deleteProduct = (id: string) =>
    Alert.alert("Delete Product", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteDoc(doc(db, "products", id)),
      },
    ]);

  /* ─── Toggle status ─── */
  const toggleStatus = (item: any) => {
    const newStatus = item.status === "sold" ? "available" : "sold";
    updateDoc(doc(db, "products", item.id), { status: newStatus });
  };

  /* ─── Upload image ─── */
  const uploadImage = async (uri: string) => {
    const data = new FormData();
    data.append("file", { uri, type: "image/jpeg", name: "profile.jpg" } as any);
    data.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: data }
    );
    return (await res.json()).secure_url;
  };

  /* ─── Pick image ─── */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      const url = await uploadImage(result.assets[0].uri);
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      await updateDoc(doc(db, "users", uid), { profilePhoto: url });
      setUser({ ...user, profilePhoto: url });
    }
  };

  /* ─── Save profile ─── */
  const saveProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await updateDoc(doc(db, "users", uid), {
      firstName, lastName, phoneNumber: phone, faculty, university,
    });
    setUser({ ...user, firstName, lastName, phoneNumber: phone, faculty, university });
    setEditVisible(false);
  };

  /* ─── Logout ─── */
  const handleLogout = async () => {
    try {
      setItems([]);
      await signOut(auth);
      router.replace("/");
    } catch (e) {
      console.log(e);
    }
  };

  const border = darkMode ? "#1e293b" : "#f1f5f9";

  return (
    <ScrollView
      style={[s.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero card ── */}
      <View style={[s.heroCard, { backgroundColor: theme.card }]}>


        {/* Avatar */}
        <TouchableOpacity style={s.avatarWrap} onPress={pickImage} activeOpacity={0.85}>
          <Image
            source={{ uri: user?.profilePhoto || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80" }}
            style={s.avatar}
          />
          <View style={s.cameraBtn}>
            <Feather name="camera" size={13} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Name & uni */}
        <Text style={[s.name, { color: theme.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        {user?.faculty ? (
          <Text style={s.facultyBadge}>{user.faculty}</Text>
        ) : null}
        <Text style={[s.uniText, { color: darkMode ? "#94a3b8" : "#64748b" }]}>
          {user?.university}
        </Text>

        {/* Action buttons */}
        <View style={s.btnRow}>
          <TouchableOpacity style={[s.outlineBtn, { borderColor: "#2563eb" }]} onPress={() => setEditVisible(true)}>
            <Feather name="edit-2" size={14} color="#2563eb" />
            <Text style={[s.outlineBtnText, { color: "#2563eb" }]}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.solidBtn} onPress={() => router.push("/Profile/change-password")}>
            <Feather name="lock" size={14} color="#fff" />
            <Text style={s.solidBtnText}>Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.iconBtn, { borderColor: darkMode ? "#334155" : "#e2e8f0" }]}
            onPress={toggleTheme}
          >
            <Feather name={darkMode ? "sun" : "moon"} size={16} color={darkMode ? "#fbbf24" : "#2563eb"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Info card ── */}
      <View style={[s.card, { backgroundColor: theme.card }]}>
        <Text style={[s.sectionTitle, { color: theme.text }]}>Personal Info</Text>

        {[
          { icon: "mail", value: user?.email },
          { icon: "phone", value: user?.phoneNumber },
          { icon: "book-open", value: user?.faculty },
          { icon: "map-pin", value: user?.university },
        ].map((row, i) => (
          <View
            key={i}
            style={[s.infoRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: border }]}
          >
            <View style={s.iconCircle}>
              <Feather name={row.icon as any} size={15} color="#2563eb" />
            </View>
            <Text style={[s.infoText, { color: theme.text }]} numberOfLines={1}>
              {row.value || "—"}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Rating card ── */}
      <View style={[s.card, { backgroundColor: theme.card }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <View style={[s.iconCircle, { backgroundColor: "#fef9c3" }]}>
            <Text style={{ fontSize: 15 }}>⭐</Text>
          </View>
          <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Seller Rating</Text>
        </View>

        {sellerRating.count > 0 ? (
          <View style={{ alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 40, fontWeight: "800", color: theme.text, lineHeight: 44 }}>
              {sellerRating.average.toFixed(1)}
            </Text>
            {/* Stars row */}
            <Stars value={sellerRating.average} size={26} gap={4} />
            <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
              Based on {sellerRating.count} {sellerRating.count === 1 ? "review" : "reviews"}
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 12, gap: 6 }}>
            <Stars value={0} size={26} gap={4} />
            <Text style={{ fontSize: 13, color: "#94a3b8" }}>No ratings yet</Text>
          </View>
        )}
      </View>

      {/* ── My Listings ── */}
      <View style={s.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
          <Feather name="grid" size={18} color="#2563eb" />
          <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 0 }]}>My Listings</Text>
          <View style={s.countBadge}>
            <Text style={s.countText}>{items.length}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.sellHeaderBtn}
          onPress={() => router.push("/Sell/sell")}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={14} color="#fff" />
          <Text style={s.sellHeaderBtnText}>Sell Item</Text>
        </TouchableOpacity>
      </View>

      <View style={s.grid}>
        {items.map((item: any) => (
          <ProductCard
            key={item.id}
            item={item}
            theme={theme}
            isFavorite={false}
            onToggleFavorite={() => {}}
            showManagement={true}
            onEdit={() => router.push({ pathname: "/product/edit-product", params: { id: item.id } })}
            onDelete={() => deleteProduct(item.id)}
            onToggleStatus={toggleStatus}
          />
        ))}
      </View>

      {items.length === 0 && (
        <View style={s.emptyWrap}>
          <Feather name="package" size={36} color="#cbd5e1" />
          <Text style={{ color: "#94a3b8", marginTop: 8, fontSize: 14 }}>No listings yet</Text>
        </View>
      )}

      {/* ── Logout ── */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Feather name="log-out" size={17} color="#fff" />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* ── Edit Modal ── */}
      <Modal visible={editVisible} animationType="slide">
        <ScrollView
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={s.modal}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.modalHeader}>
            <Text style={[s.modalTitle, { color: theme.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setEditVisible(false)}>
              <Feather name="x" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          {[
            { label: "First Name", value: firstName, set: setFirstName },
            { label: "Last Name", value: lastName, set: setLastName },
            { label: "Phone", value: phone, set: setPhone, keyboard: "phone-pad" as any },
          ].map((field) => (
            <View key={field.label} style={s.inputGroup}>
              <Text style={[s.inputLabel, { color: darkMode ? "#94a3b8" : "#64748b" }]}>{field.label}</Text>
              <TextInput
                placeholder={field.label}
                placeholderTextColor="#9ca3af"
                value={field.value}
                onChangeText={field.set}
                keyboardType={field.keyboard}
                style={[s.input, { backgroundColor: theme.card, color: theme.text }]}
              />
            </View>
          ))}

          {/* University */}
          <View style={s.inputGroup}>
            <Text style={[s.inputLabel, { color: darkMode ? "#94a3b8" : "#64748b" }]}>University</Text>
            <TextInput
              placeholder="University"
              placeholderTextColor="#9ca3af"
              value={university}
              onFocus={() => setShowUniversityList(true)}
              onChangeText={(t) => { setUniversity(t); setShowUniversityList(true); }}
              style={[s.input, { backgroundColor: theme.card, color: theme.text }]}
            />
            {showUniversityList && (
              <ScrollView style={[s.dropdown, { backgroundColor: theme.card }]} nestedScrollEnabled>
                {UNIVERSITIES.filter((u) => u.toLowerCase().includes(university.toLowerCase())).map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => { setUniversity(u); setShowUniversityList(false); }}
                    style={[s.dropdownItem, { borderBottomColor: darkMode ? "#1e293b" : "#f1f5f9" }]}
                  >
                    <Text style={{ color: theme.text, fontSize: 14 }}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Faculty */}
          <View style={s.inputGroup}>
            <Text style={[s.inputLabel, { color: darkMode ? "#94a3b8" : "#64748b" }]}>Faculty</Text>
            <TextInput
              placeholder="Faculty"
              placeholderTextColor="#9ca3af"
              value={faculty}
              onFocus={() => setShowFacultyList(true)}
              onChangeText={(t) => { setFaculty(t); setShowFacultyList(true); }}
              style={[s.input, { backgroundColor: theme.card, color: theme.text }]}
            />
            {showFacultyList && (
              <ScrollView style={[s.dropdown, { backgroundColor: theme.card }]} nestedScrollEnabled>
                {FACULTIES.filter((f) => f.toLowerCase().includes(faculty.toLowerCase())).map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => { setFaculty(f); setShowFacultyList(false); }}
                    style={[s.dropdownItem, { borderBottomColor: darkMode ? "#1e293b" : "#f1f5f9" }]}
                  >
                    <Text style={{ color: theme.text, fontSize: 14 }}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={s.modalActions}>
            <TouchableOpacity onPress={() => setEditVisible(false)} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveProfile} style={s.saveBtn}>
              <Text style={s.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

/* ══════════════════════════════════════════════ */
const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  /* Hero */
  heroCard: {
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarWrap: { position: "relative", marginBottom: 10 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: { fontSize: 20, fontWeight: "700", marginTop: 2 },
  facultyBadge: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
    overflow: "hidden",
  },
  uniText: { fontSize: 13, marginTop: 3, marginBottom: 14 },
  btnRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  outlineBtnText: { fontSize: 13, fontWeight: "600" },
  solidBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  solidBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Info card */
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { fontSize: 14, flex: 1 },

  /* Listings */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: "#2563eb",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 2,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  productCard: {
    width: "47%",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  productImg: { width: "100%", height: 110, resizeMode: "cover" },
  soldBadge: {
    position: "absolute",
    top: 7,
    left: 7,
    backgroundColor: "#ef4444",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10,
  },
  soldBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  condBadge: {
    position: "absolute",
    bottom: 7,
    left: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  condBadgeText: { fontSize: 9, fontWeight: "700" },
  productBody: { padding: 9 },
  productTitle: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  productPrice: { fontSize: 14, fontWeight: "700", color: "#2563eb", marginBottom: 8 },
  productActions: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700"
  },
  soldToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  soldToggleActive: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a"
  },
  soldToggleText: {
    fontSize: 11,
    fontWeight: "700"
  },
  sellHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  sellHeaderBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  emptyWrap: { alignItems: "center", paddingVertical: 32 },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ef4444",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 20,
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  /* Modal */
  modal: { padding: 20, paddingTop: 56, paddingBottom: 60 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.4 },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  dropdown: {
    maxHeight: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 4,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  cancelText: { color: "#ef4444", fontWeight: "600", fontSize: 15 },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});