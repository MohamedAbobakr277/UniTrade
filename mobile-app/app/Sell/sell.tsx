import React, { useState, useEffect } from "react";
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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from "expo-router";
import { db, auth } from "../services/firebase";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useTheme } from "../../constants/ThemeContext";
import { Feather } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";

// ─── Settings ───
const CLOUD_NAME = "dstfo8pxq";
const UPLOAD_PRESET = "unitrade_upload";
const BACKEND_URL = "https://unitrade-backend-five.vercel.app";

const CATEGORIES = [
  { name: "Books & Notes", icon: "book" },
  { name: "Calculators", icon: "hash" },
  { name: "Electronics", icon: "monitor" },
  { name: "Engineering Tools", icon: "tool" },
  { name: "Medical Tools", icon: "plus-square" },
  { name: "Lab Equipment", icon: "activity" },
  { name: "Stationery", icon: "edit-3" },
  { name: "Bags & Accessories", icon: "briefcase" },
];

const CONDITIONS = [
  { label: "New", color: "#166534", bg: "#dcfce7" },
  { label: "Like New", color: "#1e40af", bg: "#dbeafe" },
  { label: "Good", color: "#854d0e", bg: "#fef9c3" },
  { label: "Fair", color: "#991b1b", bg: "#fee2e2" },
  { label: "Poor", color: "#9d174d", bg: "#fce7f3" },
];

// ─── Helper: get Firebase auth token ───
async function getAuthToken(): Promise<string | null> {
  try {
    return auth.currentUser ? await auth.currentUser.getIdToken() : null;
  } catch {
    return null;
  }
}

// ─── Helper: call backend /generate ───
async function callBackendGenerate(body: object): Promise<string> {
  const token = await getAuthToken();
  const response = await fetch(`${BACKEND_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Server error ${response.status}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || data.error);
  if (!data.text) throw new Error("No response from AI");
  return data.text as string;
}

// ─── Helper: upload local URI to Cloudinary, return public URL ───
async function uploadToCloudinary(uri: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", { uri, type: "image/jpeg", name: "product.jpg" } as any);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Cloudinary upload failed");
  return data.secure_url;
}

export default function Sell() {
  const router = useRouter();
  const { theme, darkMode } = useTheme();

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(theme.background);
    NavigationBar.setButtonStyleAsync(darkMode ? "light" : "dark");
  }, [theme, darkMode]);

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTitleLoading, setAiTitleLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState("1");

  const border = darkMode ? "#1e293b" : "#e2e8f0";

  // ─── ✨ AI Auto-fill (image → backend) ───
  const handleAIAutoFill = async () => {
    if (images.length === 0) return Alert.alert("Error", "Please select an image first");

    setAiLoading(true);
    try {
      // Upload the local image to Cloudinary to get a public URL the backend can fetch
      const imageUrl = await uploadToCloudinary(images[0]);

      const rawText = await callBackendGenerate({
        prompt:
          'Marketplace Assistant: Analyze this photo for a student shop. Output ONLY a raw JSON: {"title": "", "description": "", "category": ""}. Categories: Books & Notes, Calculators, Electronics, Engineering Tools.',
        imageUrl,
      });

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const cleanJson = JSON.parse(jsonMatch[0]);
        setTitle(cleanJson.title || "");
        setDescription(cleanJson.description || "");
        if (CATEGORIES.some((c) => c.name === cleanJson.category)) {
          setCategory(cleanJson.category);
        }
      }
    } catch (e: any) {
      console.error("AI Auto-fill Error:", e.message);
      if (e.message?.includes("Network") || e.message?.includes("fetch")) {
        Alert.alert("Server Offline", "Cannot reach the backend. Make sure the server is running.");
      } else {
        Alert.alert("AI Error", e.message || "Failed to analyse image.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  // ─── ✨ Auto-fill details (title → backend) ───
  const handleAITitleAutoFill = async () => {
    if (!title.trim()) return Alert.alert("Error", "Please enter a title first");

    setAiTitleLoading(true);
    try {
      const rawText = await callBackendGenerate({
        prompt: `Marketplace Assistant: I have a product with the title "${title}". Output ONLY a raw JSON with reasonable estimates: {"description": "write a catchy description in Egyptian Arabic", "price": "estimated price in EGP as a number string", "category": "one of: Books & Notes, Calculators, Electronics, Engineering Tools, Medical Tools, Lab Equipment, Stationery, Bags & Accessories"}.`,
      });

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const cleanJson = JSON.parse(jsonMatch[0]);
        if (cleanJson.description) setDescription(cleanJson.description);
        if (cleanJson.price) setPrice(String(cleanJson.price).replace(/[^0-9]/g, ""));
        if (CATEGORIES.some((c) => c.name === cleanJson.category)) {
          setCategory(cleanJson.category);
        }
      }
    } catch (e: any) {
      console.error("AI Title Auto-fill Error:", e.message);
      if (e.message?.includes("Network") || e.message?.includes("fetch")) {
        Alert.alert("Server Offline", "Cannot reach the backend. Make sure the server is running.");
      } else {
        Alert.alert("AI Error", e.message || "Failed to generate details from title.");
      }
    } finally {
      setAiTitleLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission Required", "We need access to your photos");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.5,
    });
    if (!result.canceled && result.assets) {
      setImages([...images, ...result.assets.map((a) => a.uri)].slice(0, 10));
    }
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    formData.append("file", { uri, type: "image/jpeg", name: "product.jpg" } as any);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
    return (await res.json()).secure_url;
  };

  const handlePost = async () => {
    if (loading) return;
    if (images.length === 0 || !title || !category || !condition || !price) {
      return Alert.alert("Error", "Please fill in all the fields");
    }

    try {
      setLoading(true);
      const imageUrls = [];
      for (const img of images) imageUrls.push(await uploadImage(img));

      const uid = auth.currentUser?.uid || "";
      let sellerName = "", sellerPhoto = "", userUniversity = "";
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const d = snap.data();
        sellerName = `${d.firstName || ""} ${d.lastName || ""}`.trim();
        sellerPhoto = d.profilePhoto || "";
        userUniversity = d.university || "";
      }

      await addDoc(collection(db, "products"), {
        title, description, category, condition,
        price: Number(price),
        quantityAvailable: Number(quantityAvailable),
        images: imageUrls,
        userId: uid,
        sellerName,
        sellerEmail: auth.currentUser?.email || "",
        sellerPhoto,
        university: userUniversity,
        status: "available",
        createdAt: new Date(),
      });

      Alert.alert("Success", "Product posted successfully!");
      router.replace("/Home/home");
    } catch (e) {
      Alert.alert("Error", "Failed to post product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, padding: 16 }} 
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[s.pageTitle, { color: theme.text }]}>Sell Your Item</Text>

          <View style={[s.imageSection, { backgroundColor: theme.card, borderColor: border }]}>
            {images.length === 0 ? (
              <TouchableOpacity style={s.imagePlaceholder} onPress={pickImage}>
                <Feather name="camera" size={28} color="#94a3b8" />
                <Text style={s.imagePlaceholderText}>Add photos</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Image source={{ uri: images[0] || "https://via.placeholder.com/150" }} style={s.mainPreview} />
                <ScrollView horizontal contentContainerStyle={s.thumbRow}>
                  {images.map((img, i) => (
                    <View key={i} style={s.thumbWrap}>
                      <Image source={{ uri: img || "https://via.placeholder.com/150" }} style={s.thumb} />
                      <TouchableOpacity style={s.removeBtn} onPress={() => setImages(images.filter((_, idx) => idx !== i))}>
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

          {images.length > 0 && (
            <TouchableOpacity onPress={handleAIAutoFill} style={[s.aiBtn, { opacity: aiLoading ? 0.7 : 1 }]} disabled={aiLoading}>
              {aiLoading ? <ActivityIndicator color="white" /> : <Text style={s.aiBtnText}>✨ AI Auto-fill</Text>}
            </TouchableOpacity>
          )}

          <View style={s.fieldGroup}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={[s.label, { color: theme.text, marginBottom: 0 }]}>Title *</Text>
              {title.trim().length > 0 && (
                <TouchableOpacity onPress={handleAITitleAutoFill} disabled={aiTitleLoading}>
                  {aiTitleLoading ? <ActivityIndicator size="small" color="#8b5cf6" /> : <Text style={{ color: "#8b5cf6", fontSize: 13, fontWeight: "600" }}>✨ Auto-fill details</Text>}
                </TouchableOpacity>
              )}
            </View>
            <TextInput placeholder="Item name" placeholderTextColor="#9ca3af" value={title} onChangeText={setTitle} style={[s.input, { backgroundColor: theme.card, color: theme.text, borderColor: border }]} />
          </View>

          <View style={s.fieldGroup}>
            <Text style={[s.label, { color: theme.text }]}>Description</Text>
            <TextInput placeholder="More details..." placeholderTextColor="#9ca3af" value={description} onChangeText={setDescription} multiline style={[s.input, s.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: border }]} />
          </View>

          <View style={s.fieldGroup}>
            <Text style={[s.label, { color: theme.text }]}>Price (EGP) *</Text>
            <View style={[s.priceWrap, { backgroundColor: theme.card, borderColor: border }]}>
              <Text style={s.pricePrefix}>EGP</Text>
              <TextInput placeholder="0" placeholderTextColor="#9ca3af" value={price} onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ""))} keyboardType="numeric" style={[s.priceInput, { color: theme.text }]} />
            </View>
          </View>

          <View style={s.fieldGroup}>
            <Text style={[s.label, { color: theme.text }]}>Available Quantity *</Text>
            <TextInput placeholder="1" placeholderTextColor="#9ca3af" value={quantityAvailable} onChangeText={(t) => setQuantityAvailable(t.replace(/[^0-9]/g, ""))} keyboardType="numeric" style={[s.input, { backgroundColor: theme.card, color: theme.text, borderColor: border }]} />
          </View>

          <View style={s.fieldGroup}>
            <Text style={[s.label, { color: theme.text }]}>Category *</Text>
            <View style={s.chipGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.name} onPress={() => setCategory(cat.name)} style={[s.catChip, { backgroundColor: category === cat.name ? "#2563eb" : theme.card, borderColor: category === cat.name ? "#2563eb" : border }]}>
                  <Feather name={cat.icon as any} size={13} color={category === cat.name ? "#fff" : "#64748b"} />
                  <Text style={[s.catChipText, { color: category === cat.name ? "#fff" : theme.text }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.fieldGroup}>
            <Text style={[s.label, { color: theme.text }]}>Condition *</Text>
            <View style={s.condGrid}>
              {CONDITIONS.map((c) => (
                <TouchableOpacity key={c.label} onPress={() => setCondition(c.label)} style={[s.condChip, { backgroundColor: condition === c.label ? c.bg : theme.card, borderColor: condition === c.label ? c.color : border }]}>
                  <Text style={[s.condChipText, { color: condition === c.label ? c.color : "#64748b" }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[s.postBtn, loading && { opacity: 0.7 }]} onPress={handlePost} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.postBtnText}>Post Item</Text>}
          </TouchableOpacity>

          {/* Spacer to safely push content above BottomNav without causing ScrollView padding jumping */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNav />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  pageTitle: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  imageSection: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 12 },
  imagePlaceholder: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 8 },
  imagePlaceholderText: { fontSize: 15, fontWeight: "600", color: "#64748b" },
  mainPreview: { width: "100%", height: 220, resizeMode: "cover" },
  thumbRow: { padding: 10, gap: 8 },
  thumbWrap: { position: "relative" },
  thumb: { width: 64, height: 64, borderRadius: 10 },
  removeBtn: { position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center" },
  addMoreBtn: { width: 64, height: 64, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#bfdbfe", borderStyle: "dashed" },
  aiBtn: { backgroundColor: "#8b5cf6", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 14, borderRadius: 12, marginBottom: 20 },
  aiBtnText: { color: "white", fontWeight: "700" },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { height: 90, textAlignVertical: "top" },
  priceWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  pricePrefix: { fontSize: 15, fontWeight: "700", color: "#2563eb", marginRight: 8 },
  priceInput: { flex: 1, fontSize: 15 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catChipText: { fontSize: 13, fontWeight: "500" },
  condGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  condChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  condChipText: { fontSize: 13, fontWeight: "600" },
  postBtn: { backgroundColor: "#2563eb", paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  postBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});