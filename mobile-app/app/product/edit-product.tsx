import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useTheme } from "../../constants/ThemeContext";
import styles from "./edit-product.style";

const CATEGORIES = [
  { name: "Books & Notes",      icon: "book",        color: "#d97706", bg: "#fef3c7" },
  { name: "Calculators",        icon: "hash",        color: "#16a34a", bg: "#dcfce7" },
  { name: "Electronics",        icon: "headphones",  color: "#0891b2", bg: "#cffafe" },
  { name: "Engineering Tools",  icon: "tool",        color: "#ea580c", bg: "#ffedd5" },
  { name: "Medical Tools",      icon: "plus-square", color: "#0284c7", bg: "#e0f2fe" },
  { name: "Lab Equipment",      icon: "activity",    color: "#65a30d", bg: "#ecfccb" },
  { name: "Stationery",         icon: "edit-3",      color: "#c026d3", bg: "#fae8ff" },
  { name: "Bags & Accessories", icon: "briefcase",   color: "#b45309", bg: "#fef9c3" },
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

export default function EditProduct() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [quantityAvailable, setQuantityAvailable] = useState("1");

  useEffect(() => {
    const loadProduct = async () => {
      const ref = doc(db, "products", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data: any = snap.data();
        setTitle(data.title);
        setPrice(String(data.price));
        setCondition(data.condition);
        setCategory(data.category);
        if (data.images) setImages(data.images);
        if (data.quantityAvailable !== undefined) setQuantityAvailable(String(data.quantityAvailable));
      }
    };
    loadProduct();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setImages([...images, result.assets[0].uri]);
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const updateProduct = async () => {
    if (!title || !price) { Alert.alert("Error", "Please fill all fields"); return; }
    if (!quantityAvailable || Number(quantityAvailable) <= 0) {
      Alert.alert("Error", "Quantity must be greater than 0");
      return;
    }
    try {
      await updateDoc(doc(db, "products", id as string), {
        title, price: Number(price), condition, category, images,
        quantityAvailable: Number(quantityAvailable)
      });
      Alert.alert("Success", "Product updated");
      router.back();
    } catch {
      Alert.alert("Error", "Failed to update");
    }
  };

  const border = theme.card === "#1e293b" ? "#1e293b" : "#e2e8f0";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView 
            style={[styles.container, { backgroundColor: theme.background }]}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
        <Text style={[styles.title, { color: theme.text }]}>Edit Product</Text>

        {/* Title */}
        <TextInput
          placeholder="Product Title" placeholderTextColor="#9ca3af"
          value={title} onChangeText={setTitle}
          style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
        />

        {/* Price */}
        <TextInput
          placeholder="Price" placeholderTextColor="#9ca3af"
          value={price} onChangeText={setPrice} keyboardType="numeric"
          style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
        />

        {/* Quantity */}
        <View style={{ marginBottom: 4 }}>
          <Text style={[styles.section, { color: theme.text, marginBottom: 5 }]}>Available Quantity</Text>
          <TextInput
            placeholder="Available Quantity" 
            placeholderTextColor="#9ca3af"
            value={quantityAvailable} 
            onChangeText={(t) => {
              const clean = t.replace(/[^0-9]/g, "");
              setQuantityAvailable(clean);
            }} 
            onBlur={() => {
              if (!quantityAvailable || Number(quantityAvailable) <= 0) {
                setQuantityAvailable("1");
                Alert.alert("Invalid Quantity", "Product quantity must be at least 1.");
              }
            }}
            keyboardType="numeric"
            style={[styles.input, { 
              color: theme.text, 
              backgroundColor: theme.card,
              borderColor: (Number(quantityAvailable) <= 0 && quantityAvailable !== "") ? "#ef4444" : border,
              borderWidth: (Number(quantityAvailable) <= 0 && quantityAvailable !== "") ? 1.5 : 1
            }]}
          />
          {(Number(quantityAvailable) <= 0 && quantityAvailable !== "") && (
            <Text style={{ color: "#ef4444", fontSize: 12, marginLeft: 12, marginTop: -10, marginBottom: 10 }}>
              Quantity must be 1 or more
            </Text>
          )}
        </View>

        {/* Category */}
        <Text style={[styles.section, { color: theme.text }]}>Category</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10, gap: 8 }}>
          {CATEGORIES.map((cat) => {
            const active = category === cat.name;
            return (
              <TouchableOpacity
                key={cat.name}
                onPress={() => setCategory(cat.name)}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 6,
                  backgroundColor: active ? "#2563eb" : theme.card,
                  paddingHorizontal: 12, paddingVertical: 8,
                  borderRadius: 20, borderWidth: 1.5,
                  borderColor: active ? "#2563eb" : border,
                }}
              >
                <View style={{
                  width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center",
                  backgroundColor: active ? "rgba(255,255,255,0.22)" : cat.bg,
                }}>
                  <Feather name={cat.icon as any} size={12} color={active ? "#fff" : cat.color} />
                </View>
                <Text style={{ color: active ? "#fff" : theme.text, fontSize: 13, fontWeight: "600" }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Condition */}
        <Text style={[styles.section, { color: theme.text }]}>Condition</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10, gap: 8 }}>
          {CONDITIONS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCondition(c)}
              style={{
                paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
                borderWidth: 1.5,
                backgroundColor: condition === c ? "#2563eb" : theme.card,
                borderColor: condition === c ? "#2563eb" : border,
              }}
            >
              <Text style={{ color: condition === c ? "#fff" : theme.text, fontWeight: "600", fontSize: 13 }}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Images */}
        <Text style={[styles.section, { color: theme.text }]}>Images</Text>
        <View style={styles.imagesContainer}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageBox}>
              <Image source={{ uri: img || "https://via.placeholder.com/150" }} style={styles.image} />
              <TouchableOpacity style={styles.deleteImage} onPress={() => removeImage(index)}>
                <Feather name="x" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={pickImage}>
          <Text style={styles.addText}>Add Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={updateProduct}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}