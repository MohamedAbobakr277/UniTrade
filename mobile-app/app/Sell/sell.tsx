import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { db, auth } from "../services/firebase";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import styles from "./sell.styles";
import { useTheme } from "../../constants/ThemeContext";

const CLOUD_NAME = "dstfo8pxq";
const UPLOAD_PRESET = "unitrade_upload";

const categories = [
  "Books & Notes", "Calculators", "Laptops & Tablets", "Electronics",
  "Engineering Tools", "Medical Tools", "Lab Equipment", "Stationery",
  "Bags & Accessories", "Furniture"
];

const conditions = ["Good", "Fair", "Poor"];

const universities = [
  "Cairo University", "Ain Shams University", "Alexandria University",
  "Mansoura University", "Assiut University", "Helwan University",
  "Tanta University", "Zagazig University", "Suez Canal University",
  "Al-Azhar University", "German University in Cairo", "British University in Egypt",
  "October 6 University", "Future University in Egypt"
];

const faculties = [
  "Computer Science", "Engineering", "Medicine", "Pharmacy", "Law",
  "Business Administration", "Dentistry", "Arts", "Science", "Nursing",
  "Education", "Agriculture", "Economics", "Philosophy", "Mass Communication"
];

export default function Sell() {
  const router = useRouter();
  const { theme } = useTheme();

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.7
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      const allImages = [...images, ...newImages];
      if (allImages.length > 10) {
        Alert.alert("Maximum 10 images allowed");
        return;
      }
      setImages(allImages);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImage = async (imageUri: string) => {
    const data = new FormData();
    data.append("file", { uri: imageUri, type: "image/jpeg", name: "upload.jpg" } as any);
    data.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data
    });
    const file = await res.json();
    return file.secure_url;
  };

  const uploadImages = async () => {
    const urls: string[] = [];
    for (const img of images) {
      const url = await uploadImage(img);
      urls.push(url);
    }
    return urls;
  };

  const handlePost = async () => {
    if (loading) return;
    if (images.length === 0) { Alert.alert("Add at least one image"); return; }
    if (!title || !category || !condition || !price) { Alert.alert("Fill required fields"); return; }

    try {
      setLoading(true);
      const imageUrls = await uploadImages();
      let sellerName = "";
      let sellerPhoto = "";
      let userId = auth.currentUser?.uid || "";
      let sellerEmail = auth.currentUser?.email || "";

      if (userId) {
        const userSnap = await getDoc(doc(db, "users", userId));
        if (userSnap.exists()) {
          const data = userSnap.data();
          sellerName = `${data.firstName || ""} ${data.lastName || ""}`;
          sellerPhoto = data.profilePhoto || data.photoURL || "";
        }
      }

      await addDoc(collection(db, "products"), {
        title, description, category, condition, university, faculty, price,
        images: imageUrls, userId, sellerName: sellerName.trim(),
        sellerEmail, sellerPhoto, createdAt: new Date()
      });

      Alert.alert("Success", "Product posted successfully");
      router.replace("/Home/home");
    } catch (e) {
      Alert.alert("Error", "Error posting product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ padding: 20 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15, color: theme.text }}>
          Sell Your Item
        </Text>

        {/* الحل: استخدام التيرناري ( ? : ) بدل الـ && عشان نضمن مفيش 0 يترسم */}
        {images.length > 0 ? (
          <Image
            source={{ uri: images[0] }}
            style={{ width: "100%", height: 200, borderRadius: 15, marginBottom: 10 }}
          />
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
          {images.map((img, index) => (
            <View key={index} style={{ marginRight: 10, marginBottom: 10 }}>
              <Image source={{ uri: img }} style={{ width: 70, height: 70, borderRadius: 10 }} />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                style={{ position: "absolute", top: -5, right: -5, backgroundColor: "black", borderRadius: 20, paddingHorizontal: 6 }}
              >
                <Text style={{ color: "white", fontSize: 12 }}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={pickImage}
          style={{ marginBottom: 15, backgroundColor: theme.card, padding: 12, borderRadius: 10, alignItems: "center" }}
        >
          <Text style={{ color: theme.text }}>Add Images</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Title"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
          style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        />

        <TextInput
          placeholder="Description"
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 80, backgroundColor: theme.card, color: theme.text }]}
          multiline
        />

        <Text style={[styles.label, { color: theme.text, marginBottom: 5 }]}>Category</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 15 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={{ backgroundColor: category === cat ? "#2563EB" : theme.card, padding: 10, borderRadius: 10, marginRight: 8, marginBottom: 8 }}
            >
              <Text style={{ color: category === cat ? "white" : theme.text }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.text, marginBottom: 5 }]}>Condition</Text>
        <View style={{ flexDirection: "row", marginBottom: 15 }}>
          {conditions.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCondition(c)}
              style={{ flex: 1, backgroundColor: condition === c ? "#2563EB" : theme.card, padding: 10, borderRadius: 10, marginRight: 8, alignItems: "center" }}
            >
              <Text style={{ color: condition === c ? "white" : theme.text }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder="University"
          placeholderTextColor="#9ca3af"
          value={university}
          onFocus={() => setShowUniversity(true)}
          style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        />

        {showUniversity ? (
          <View style={[styles.dropdown, { backgroundColor: theme.card, maxHeight: 150, marginBottom: 10, borderRadius: 10 }]}>
            <ScrollView nestedScrollEnabled={true}>
              {universities.map((u) => (
                <TouchableOpacity key={u} onPress={() => { setUniversity(u); setShowUniversity(false); }} style={{ padding: 12 }}>
                  <Text style={{ color: theme.text }}>{u}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <TextInput
          placeholder="Faculty"
          placeholderTextColor="#9ca3af"
          value={faculty}
          onFocus={() => setShowFaculty(true)}
          style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        />

        {showFaculty ? (
          <View style={[styles.dropdown, { backgroundColor: theme.card, maxHeight: 150, marginBottom: 10, borderRadius: 10 }]}>
            <ScrollView nestedScrollEnabled={true}>
              {faculties.map((f) => (
                <TouchableOpacity key={f} onPress={() => { setFaculty(f); setShowFaculty(false); }} style={{ padding: 12 }}>
                  <Text style={{ color: theme.text }}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <TextInput
          placeholder="Price"
          placeholderTextColor="#9ca3af"
          value={price}
          onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
        />

        <TouchableOpacity
          onPress={handlePost}
          style={{ backgroundColor: "#2563EB", padding: 15, borderRadius: 10, marginTop: 15, alignItems: "center" }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold" }}>Post Item</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}