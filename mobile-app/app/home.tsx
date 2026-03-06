// mobile-app/app/home.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

import BottomNav from "../components/BottomNav";

export default function HomeScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  /* ================= FIREBASE ================= */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    });
    return unsubscribe;
  }, []);

  /* ================= CATEGORIES ================= */
  const categories = [
    { name: "All", icon: "home" },
    { name: "Books", icon: "book" },
    { name: "Calculators", icon: "hash" },
    { name: "Laptops", icon: "monitor" },
    { name: "Engineering", icon: "tool" },
    { name: "Medical", icon: "plus-square" },
  ];

  /* ================= FILTER ================= */
  const filteredItems = items.filter((item) => {
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  /* ================= PRODUCT CARD ================= */
  const renderItem = ({ item }: any) => {
    const imageUrl =
      Array.isArray(item.images) && item.images.length > 0
        ? item.images[0]
        : "https://via.placeholder.com/150";

    return (
      <TouchableOpacity style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.price}>{item.price} EGP</Text>
          <Text style={styles.meta}>{item.university}</Text>
          <Text style={styles.meta}>{item.condition}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      
      {/* HEADER SECTION - Wrapped to maintain padding */}
      <View style={styles.paddingWrapper}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Marketplace</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push("/profile")} style={{ marginRight: 10 }}>
              <Feather name="user" size={24} color="#2563EB" />
            </TouchableOpacity>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} />
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="gray" />
          <TextInput
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* CATEGORIES - Horizontal Scroll */}
      <View style={{ height: 110, marginBottom: 5 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }} // لضمان عدم التصاق العناصر بالحواف
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCategory(cat.name)}
              style={[
                styles.categoryCard,
                selectedCategory === cat.name && { backgroundColor: "#1E40AF" },
              ]}
            >
              <Feather name={cat.icon as any} size={22} color="white" style={{ marginBottom: 6 }} />
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* PRODUCTS LIST */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* BOTTOM NAV */}
      <BottomNav />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  paddingWrapper: {
    paddingHorizontal: 15,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 45,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
  },
  categoryCard: {
    backgroundColor: "#2563EB",
    width: 90,
    height: 100,
    borderRadius: 14,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 5,
  },
  categoryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  // تم تحسين الـ Card لضمان عدم التداخل
  card: {
    backgroundColor: "white",
    borderRadius: 14,
    width: "48%", 
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  flatListContent: {
    paddingBottom: 100, // مساحة للـ BottomNav لكي لا يغطي الكروت الأخيرة
  },
  image: {
    width: "100%",
    height: 120,
  },
  cardContent: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  price: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: "gray",
  },
});