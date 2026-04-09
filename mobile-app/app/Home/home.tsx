import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../constants/ThemeContext";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import BottomNav from "../../components/BottomNav";

/* ─── Types ─── */
interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  university: string;
  condition: string;
  category: string;
  userId: string;
  sold: boolean;
  createdAt?: { toDate: () => Date };
}

interface UserMap {
  [uid: string]: { firstName?: string; profilePhoto?: string };
}

/* ─── Helpers ─── */
function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} h ago`;
  return `${Math.floor(diff / 1440)} d ago`;
}

const PLACEHOLDER = "https://via.placeholder.com/150";
const AVATAR_PLACEHOLDER =
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&q=80";

/* ─── Categories ─── */
const CATEGORIES = [
  { name: "All", icon: "home" },
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

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor", "Used"];

const ALL_UNIVERSITIES = [
  "Cairo University", "Ain Shams University", "Alexandria University",
  "Mansoura University", "Assiut University", "Helwan University",
  "Tanta University", "Zagazig University", "Suez Canal University",
  "Al-Azhar University", "German University in Cairo",
  "British University in Egypt", "October 6 University",
  "Future University in Egypt", "AASTMT", "Nile University",
  "Misr International University", "MSA University", "Pharos University",
  "Sohag University", "Beni-Suef University", "Fayoum University",
  "South Valley University", "Kafr El Sheikh University",
  "Damanhour University", "Others",
];

/* ══════════════════════════════════════════════ */
export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  /* State */
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [users, setUsers] = useState<UserMap>({});
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  /* ─── Bottom sheet drag ─── */
  const sheetY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: Animated.event([null, { dy: sheetY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 150) {
          Animated.timing(sheetY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setFilterVisible(false);
            sheetY.setValue(0);
          });
        } else {
          Animated.spring(sheetY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  /* ─── Firestore: products ─── */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const data = snap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, "id">) }))
        .filter((item) => !item.sold);
      setItems(data);
    });
    return unsub;
  }, []);

  /* ─── Firestore: users ─── */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const map: UserMap = {};
      snap.docs.forEach((doc) => (map[doc.id] = doc.data() as UserMap[string]));
      setUsers(map);
    });
    return unsub;
  }, []);

  /* ─── Load favorites ─── */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDocs(
      query(collection(db, "favorites"), where("userId", "==", uid))
    ).then((snap) => setFavorites(snap.docs.map((d) => d.data().productId)));
  }, []);

  /* ─── Toggle favorite ─── */
  const toggleFavorite = async (productId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const snap = await getDocs(
      query(
        collection(db, "favorites"),
        where("userId", "==", uid),
        where("productId", "==", productId)
      )
    );

    if (snap.empty) {
      await addDoc(collection(db, "favorites"), { userId: uid, productId });
      setFavorites((prev) => [...prev, productId]);
    } else {
      snap.forEach((d) => deleteDoc(d.ref));
      setFavorites((prev) => prev.filter((id) => id !== productId));
    }
  };

  /* ─── Reset filters ─── */
  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedUniversity("");
    setSelectedCondition("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
  };

  /* ─── Derived data ─── */
  // merge universities from products + static list, deduplicated
  const universities = [
    ...new Set([
      ...ALL_UNIVERSITIES,
      ...items.map((i) => i.university).filter(Boolean),
    ]),
  ];

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) &&
      (selectedCategory === "All" || item.category === selectedCategory) &&
      (!selectedUniversity || item.university === selectedUniversity) &&
      (!selectedCondition || item.condition === selectedCondition) &&
      (!minPrice || item.price >= Number(minPrice)) &&
      (!maxPrice || item.price <= Number(maxPrice))
    );
  });

  /* ─── Product card ─── */
  const renderItem = ({ item }: { item: Product }) => {
    const imageUri =
      Array.isArray(item.images) && item.images.length > 0
        ? item.images[0]
        : PLACEHOLDER;
    const seller = users[item.userId];
    const sellerName = seller?.firstName ?? "Unknown";
    const sellerPhoto = seller?.profilePhoto ?? AVATAR_PLACEHOLDER;
    const createdAt = item.createdAt?.toDate?.();
    const isFav = favorites.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[s.card, { backgroundColor: theme.card }]}
        onPress={() =>
          router.push({ pathname: "/product/[id]", params: { id: item.id } })
        }
      >
        {/* Image */}
        <View style={s.imageWrapper}>
          <Image source={{ uri: imageUri }} style={s.image} />

          {/* Condition badge */}
          {item.condition ? (
            <View style={s.conditionBadge}>
              <Text style={s.conditionText}>{item.condition}</Text>
            </View>
          ) : null}

          {/* Favourite button */}
          <TouchableOpacity
            style={[s.favBtn, isFav && s.favBtnActive]}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather
              name={isFav ? "heart" : "heart"}
              size={16}
              color={isFav ? "#ef4444" : "#fff"}
              style={isFav ? { opacity: 1 } : { opacity: 0.85 }}
            />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={s.cardBody}>
          <Text style={[s.itemTitle, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>

          <Text style={s.price}>{item.price} EGP</Text>

          <Text style={s.university} numberOfLines={1}>
            {item.university}
          </Text>

          {/* Seller row */}
          <View style={s.sellerRow}>
            <View style={s.sellerInfo}>
              <Image source={{ uri: sellerPhoto }} style={s.avatar} />
              <Text
                style={[s.sellerName, { color: theme.text }]}
                numberOfLines={1}
              >
                {sellerName}
              </Text>
            </View>

            {createdAt && (
              <View style={s.timeRow}>
                <Feather name="clock" size={12} color="#94a3b8" />
                <Text style={s.timeText}>{timeAgo(createdAt)}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ══════════ UI ══════════ */
  return (
    <SafeAreaView
      style={[s.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: theme.text }]}>Marketplace</Text>
        <Image
          source={require("../../assets/images/logo.png")}
          style={s.logo}
        />
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={[s.searchBox, { backgroundColor: theme.card }]}>
          <Feather name="search" size={17} color={theme.text} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#94a3b8"
            style={[s.searchInput, { color: theme.text }]}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={17} color={theme.text} />
            </TouchableOpacity>
          )}
          <View style={s.divider} />
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={s.filterBtn}
          >
            <Feather name="sliders" size={17} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={{ height: 60 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catList}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.name}
                onPress={() => setSelectedCategory(cat.name)}
                style={[s.catItem, active && s.catItemActive]}
                activeOpacity={0.75}
              >
                <Feather
                  name={cat.icon as any}
                  size={15}
                  color={active ? "#fff" : "#334155"}
                />
                <Text style={[s.catText, active && s.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={s.resultsRow}>
        <Text style={{ color: "#94a3b8", fontSize: 13 }}>
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Product grid */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={s.columnWrapper}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Feather name="inbox" size={40} color="#cbd5e1" />
            <Text style={s.emptyText}>No products found</Text>
          </View>
        }
      />

      {/* Filter bottom sheet */}
      <Modal visible={filterVisible} transparent animationType="fade">
        <View style={s.backdrop}>
          <Animated.View
            style={[
              s.sheet,
              { backgroundColor: theme.card },
              {
                transform: [
                  {
                    translateY: sheetY.interpolate({
                      inputRange: [0, 600],
                      outputRange: [0, 600],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {/* Handle */}
            <View style={[s.sheetHandle, { backgroundColor: theme.background }]} />

            <View style={s.sheetHeader}>
              <Text style={[s.sheetTitle, { color: theme.text }]}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Feather name="x" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* University */}
            <Text style={[s.filterLabel, { color: theme.text }]}>University</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 4 }}
            >
              {universities.map((uni) => (
                <TouchableOpacity
                  key={uni}
                  onPress={() =>
                    setSelectedUniversity(uni === selectedUniversity ? "" : uni)
                  }
                  style={[
                    s.chip,
                    s.chipBlue,
                    selectedUniversity === uni && s.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      s.chipText,
                      selectedUniversity === uni && s.chipTextSelected,
                    ]}
                  >
                    {uni}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Condition */}
            <Text style={[s.filterLabel, { color: theme.text }]}>Condition</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 4 }}
            >
              {CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  onPress={() =>
                    setSelectedCondition(cond === selectedCondition ? "" : cond)
                  }
                  style={[
                    s.chip,
                    s.chipGreen,
                    selectedCondition === cond && s.chipSelectedGreen,
                  ]}
                >
                  <Text
                    style={[
                      s.chipTextGreen,
                      selectedCondition === cond && s.chipTextSelectedGreen,
                    ]}
                  >
                    {cond}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Price range */}
            <Text style={[s.filterLabel, { color: theme.text }]}>Price Range (EGP)</Text>
            <View style={s.priceRow}>
              <TextInput
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder="Min"
                placeholderTextColor="#94a3b8"
                style={[s.priceInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.background }]}
              />
              <Text style={{ color: "#94a3b8", paddingHorizontal: 8 }}>—</Text>
              <TextInput
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder="Max"
                placeholderTextColor="#94a3b8"
                style={[s.priceInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.background }]}
              />
            </View>

            {/* Actions */}
            <View style={s.sheetActions}>
              <TouchableOpacity onPress={resetFilters} style={s.resetBtn}>
                <Text style={s.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterVisible(false)}
                style={s.applyBtn}
              >
                <Text style={s.applyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

/* ══════════════════════════════════════════════ */
const s = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  logo: { width: 36, height: 36, resizeMode: "contain" },

  /* Search */
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  divider: { width: 1, height: 18, backgroundColor: "#e2e8f0" },
  filterBtn: { paddingLeft: 4 },

  /* Categories */
  catList: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
  },
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
  },
  catItemActive: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },
  catText: { fontSize: 13, color: "#334155", fontWeight: "600" },
  catTextActive: { color: "#fff" },

  /* Results count */
  resultsRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  /* Card */
  card: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: { position: "relative" },
  image: { width: "100%", aspectRatio: 1, resizeMode: "cover" },
  conditionBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  favBtnActive: { backgroundColor: "rgba(255,255,255,0.85)" },
  cardBody: { padding: 10 },
  itemTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 2,
  },
  university: { fontSize: 12, color: "#94a3b8", marginBottom: 6 },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sellerInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 20, height: 20, borderRadius: 10, marginRight: 5 },
  sellerName: { fontSize: 12, flex: 1 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  timeText: { fontSize: 11, color: "#94a3b8" },

  /* List */
  columnWrapper: { paddingHorizontal: 16, gap: 12 },
  listContent: { paddingBottom: 100 },
  emptyWrap: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15 },

  /* Filter sheet */
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* Chips */
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipBlue: { borderColor: "#bfdbfe", backgroundColor: "#eff6ff" },
  chipSelected: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipText: { color: "#2563eb", fontSize: 13, fontWeight: "500" },
  chipTextSelected: { color: "#fff" },
  chipGreen: { borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" },
  chipSelectedGreen: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  chipTextGreen: { color: "#16a34a", fontSize: 13, fontWeight: "500" },
  chipTextSelectedGreen: { color: "#fff" },

  /* Price inputs */
  priceRow: { flexDirection: "row", alignItems: "center" },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0f172a",
  },

  /* Sheet actions */
  sheetActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2563eb",
    alignItems: "center",
  },
  resetText: { color: "#2563eb", fontWeight: "600", fontSize: 15 },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  applyText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});