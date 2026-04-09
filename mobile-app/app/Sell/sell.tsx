import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { db, auth } from "../services/firebase";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useTheme } from "../../constants/ThemeContext";
import { Feather } from "@expo/vector-icons";

const CLOUD_NAME = "dstfo8pxq";
const UPLOAD_PRESET = "unitrade_upload";

const CATEGORIES = [
  { name: "Books & Notes", icon: "book" },
  { name: "Calculators", icon: "hash" },
  { name: "Laptops & Tablets", icon: "monitor" },
  { name: "Electronics", icon: "headphones" },
  { name: "Engineering Tools", icon: "tool" },
  { name: "Medical Tools", icon: "plus-square" },
  { name: "Lab Equipment", icon: "activity" },
  { name: "Stationery", icon: "edit-3" },
  { name: "Bags & Accessories", icon: "briefcase" },
  { name: "Furniture", icon: "box" },
];

const CONDITIONS: { label: string; color: string; bg: string }[] = [
  { label: "New",       color: "#166534", bg: "#dcfce7" },
  { label: "Like New",  color: "#1e40af", bg: "#dbeafe" },
  { label: "Good",      color: "#854d0e", bg: "#fef9c3" },
  { label: "Fair",      color: "#991b1b", bg: "#fee2e2" },
  { label: "Poor",      color: "#9d174d", bg: "#fce7f3" },
  { label: "Used",      color: "#475569", bg: "#f1f5f9" },
];

const UNIVERSITIES = [
  "Cairo University", "Ain Shams University", "Alexandria University",
  "Mansoura University", "Assiut University", "Helwan University",
  "Tanta University", "Zagazig University", "Suez Canal University",
  "Al-Azhar University", "German University in Cairo",
  "British University in Egypt", "October 6 University",
  "Future University in Egypt", "AASTMT", "Nile University",
  "Misr International University", "MSA University",
  "Pharos University", "Sohag University", "Others",
];

const FACULTIES = [
  "Computer Science", "Engineering", "Medicine", "Pharmacy", "Law",
  "Business Administration", "Dentistry", "Arts", "Science", "Nursing",
  "Education", "Agriculture", "Economics", "Philosophy",
  "Mass Communication", "Others",
];

export default function Sell() {
  const router = useRouter();
  const { theme, darkMode } = useTheme();

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [price, setPrice] = useState("");
  const [showUniversity, setShowUniversity] = useState(false);
  const [showFaculty, setShowFaculty] = useState(false);

  const border = darkMode ? "#1e293b" : "#e2e8f0";

  /* ─── Pick images ─── */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission required"); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      const merged = [...images, ...result.assets.map((a) => a.uri)];
      if (merged.length > 10) { Alert.alert("Maximum 10 images"); return; }
      setImages(merged);
    }
  };

  /* ─── Upload ─── */
  const uploadImage = async (uri: string) => {
    const data = new FormData();
    data.append("file", { uri, type: "image/jpeg", name: "upload.jpg" } as any);
    data.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: data }
    );
    return (await res.json()).secure_url as string;
  };

  /* ─── Post ─── */
  const handlePost = async () => {
    if (loading) return;
    if (images.length === 0) { Alert.alert("Add at least one image"); return; }
    if (!title || !category || !condition || !price) {
      Alert.alert("Fill all required fields"); return;
    }
    try {
      setLoading(true);
      const imageUrls: string[] = [];
      for (const img of images) imageUrls.push(await uploadImage(img));

      const uid = auth.currentUser?.uid || "";
      let sellerName = "", sellerPhoto = "";
      if (uid) {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const d = snap.data();
          sellerName = `${d.firstName || ""} ${d.lastName || ""}`.trim();
          sellerPhoto = d.profilePhoto || d.photoURL || "";
        }
      }

      await addDoc(collection(db, "products"), {
        title, description, category, condition,
        university, faculty,
        price: Number(price),
        images: imageUrls,
        userId: uid,
        sellerName,
        sellerEmail: auth.currentUser?.email || "",
        sellerPhoto,
        status: "available",
        createdAt: new Date(),
      });

      Alert.alert("Success", "Product posted!");
      router.replace("/Home/home");
    } catch (e) {
      Alert.alert("Error", "Failed to post product");
    } finally {
      setLoading(false);
    }
  };

  /* ══════════ UI ══════════ */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={[s.pageTitle, { color: theme.text }]}>Sell Your Item</Text>

        {/* ── Images ── */}
        <View style={[s.imageSection, { backgroundColor: theme.card, borderColor: border }]}>
          {images.length === 0 ? (
            <TouchableOpacity style={s.imagePlaceholder} onPress={pickImage}>
              <Feather name="camera" size={28} color="#94a3b8" />
              <Text style={s.imagePlaceholderText}>Add photos</Text>
              <Text style={s.imagePlaceholderSub}>Up to 10 images</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Image source={{ uri: images[0] }} style={s.mainPreview} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.thumbRow}
              >
                {images.map((img, i) => (
                  <View key={i} style={s.thumbWrap}>
                    <Image source={{ uri: img }} style={s.thumb} />
                    <TouchableOpacity
                      style={s.removeBtn}
                      onPress={() => setImages(images.filter((_, idx) => idx !== i))}
                    >
                      <Feather name="x" size={10} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 10 && (
                  <TouchableOpacity style={[s.addMoreBtn, { backgroundColor: theme.background }]} onPress={pickImage}>
                    <Feather name="plus" size={20} color="#2563eb" />
                  </TouchableOpacity>
                )}
              </ScrollView>
            </>
          )}
        </View>

        {/* ── Title ── */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: theme.text }]}>Title <Text style={s.required}>*</Text></Text>
          <TextInput
            placeholder="What are you selling?"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
            style={[s.input, { backgroundColor: theme.card, color: theme.text, borderColor: border }]}
          />
        </View>

        {/* ── Description ── */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: theme.text }]}>Description</Text>
          <TextInput
            placeholder="Describe your item..."
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={[s.input, s.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: border }]}
          />
        </View>

        {/* ── Price ── */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: theme.text }]}>Price (EGP) <Text style={s.required}>*</Text></Text>
          <View style={[s.priceWrap, { backgroundColor: theme.card, borderColor: border }]}>
            <Text style={s.pricePrefix}>EGP</Text>
            <TextInput
              placeholder="0"
              placeholderTextColor="#9ca3af"
              value={price}
              onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              style={[s.priceInput, { color: theme.text }]}
            />
          </View>
        </View>

        {/* ── Category ── */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: theme.text }]}>Category <Text style={s.required}>*</Text></Text>
          <View style={s.chipGrid}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setCategory(cat.name)}
                  style={[
                    s.catChip,
                    { backgroundColor: active ? "#2563eb" : theme.card, borderColor: active ? "#2563eb" : border },
                  ]}
                >
                  <Feather name={cat.icon as any} size={13} color={active ? "#fff" : "#64748b"} />
                  <Text style={[s.catChipText, { color: active ? "#fff" : theme.text }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Condition ── */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: theme.text }]}>Condition <Text style={s.required}>*</Text></Text>
          <View style={s.condGrid}>
            {CONDITIONS.map((c) => {
              const active = condition === c.label;
              return (
                <TouchableOpacity
                  key={c.label}
                  onPress={() => setCondition(c.label)}
                  style={[
                    s.condChip,
                    {
                      backgroundColor: active ? c.bg : theme.card,
                      borderColor: active ? c.color : border,
                      borderWidth: active ? 1.5 : 1,
                    },
                  ]}
                >
                  <Text style={[s.condChipText, { color: active ? c.color : "#64748b" }]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── University ── */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: theme.text }]}>University</Text>
          <TouchableOpacity
            style={[s.selectBtn, { backgroundColor: theme.card, borderColor: border }]}
            onPress={() => { setShowUniversity(!showUniversity); setShowFaculty(false); }}
          >
            <Text style={{ color: university ? theme.text : "#9ca3af", flex: 1 }}>
              {university || "Select university"}
            </Text>
            <Feather name={showUniversity ? "chevron-up" : "chevron-down"} size={16} color="#94a3b8" />
          </TouchableOpacity>
          {showUniversity && (
            <View style={[s.dropdown, { backgroundColor: theme.card, borderColor: border }]}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                {UNIVERSITIES.map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => { setUniversity(u); setShowUniversity(false); }}
                    style={[s.dropdownItem, { borderBottomColor: border }]}
                  >
                    <Text style={{ color: u === university ? "#2563eb" : theme.text, fontWeight: u === university ? "600" : "400" }}>
                      {u}
                    </Text>
                    {u === university && <Feather name="check" size={14} color="#2563eb" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ── Faculty ── */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, { color: theme.text }]}>Faculty</Text>
          <TouchableOpacity
            style={[s.selectBtn, { backgroundColor: theme.card, borderColor: border }]}
            onPress={() => { setShowFaculty(!showFaculty); setShowUniversity(false); }}
          >
            <Text style={{ color: faculty ? theme.text : "#9ca3af", flex: 1 }}>
              {faculty || "Select faculty"}
            </Text>
            <Feather name={showFaculty ? "chevron-up" : "chevron-down"} size={16} color="#94a3b8" />
          </TouchableOpacity>
          {showFaculty && (
            <View style={[s.dropdown, { backgroundColor: theme.card, borderColor: border }]}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                {FACULTIES.map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => { setFaculty(f); setShowFaculty(false); }}
                    style={[s.dropdownItem, { borderBottomColor: border }]}
                  >
                    <Text style={{ color: f === faculty ? "#2563eb" : theme.text, fontWeight: f === faculty ? "600" : "400" }}>
                      {f}
                    </Text>
                    {f === faculty && <Feather name="check" size={14} color="#2563eb" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ── Post button ── */}
        <TouchableOpacity
          style={[s.postBtn, loading && { opacity: 0.7 }]}
          onPress={handlePost}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="upload" size={18} color="#fff" />
              <Text style={s.postBtnText}>Post Item</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 60 },
  pageTitle: { fontSize: 24, fontWeight: "700", marginBottom: 20 },

  /* Images */
  imageSection: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  imagePlaceholderText: { fontSize: 15, fontWeight: "600", color: "#64748b" },
  imagePlaceholderSub: { fontSize: 12, color: "#94a3b8" },
  mainPreview: { width: "100%", height: 220, resizeMode: "cover" },
  thumbRow: { padding: 10, gap: 8 },
  thumbWrap: { position: "relative" },
  thumb: { width: 64, height: 64, borderRadius: 10 },
  removeBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreBtn: {
    width: 64,
    height: 64,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#bfdbfe",
    borderStyle: "dashed",
  },

  /* Fields */
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  required: { color: "#ef4444" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: { height: 90, textAlignVertical: "top" },

  /* Price */
  priceWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pricePrefix: { fontSize: 15, fontWeight: "700", color: "#2563eb", marginRight: 8 },
  priceInput: { flex: 1, fontSize: 15 },

  /* Category chips */
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catChipText: { fontSize: 13, fontWeight: "500" },

  /* Condition */
  condGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  condChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  condChipText: { fontSize: 13, fontWeight: "600" },

  /* Dropdown */
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  /* Post button */
  postBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  postBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});