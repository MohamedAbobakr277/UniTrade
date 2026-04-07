import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../constants/ThemeContext";
import {
  doc, getDoc, collection, query, where, getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 16 * 2 - 12) / 2;

type SellerUser = {
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  university?: string;
  faculty?: string;
};

type Product = {
  id: string;
  title: string;
  price: number;
  images?: string[];
  condition?: string;
  sold?: boolean;
};

const CONDITION_COLOR: Record<string, { bg: string; text: string }> = {
  New: { bg: "#dcfce7", text: "#166534" },
  "Like New": { bg: "#dbeafe", text: "#1e40af" },
  Good: { bg: "#fef9c3", text: "#854d0e" },
  Used: { bg: "#f1f5f9", text: "#475569" },
  Fair: { bg: "#fee2e2", text: "#991b1b" },
  Poor: { bg: "#fce7f3", text: "#9d174d" },
};

export default function SellerProfile() {
  const { theme } = useTheme();
  const { sellerId } = useLocalSearchParams();
  const uid = Array.isArray(sellerId) ? sellerId[0] : sellerId;

  const [seller, setSeller] = useState<SellerUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        /* user data */
        const uSnap = await getDoc(doc(db, "users", uid));
        if (uSnap.exists()) setSeller(uSnap.data() as SellerUser);

        /* products - تم إزالة شرط where("sold", "==", false) لجلب كل المنتجات */
        const snap = await getDocs(
          query(collection(db, "products"), where("userId", "==", uid))
        );
        setProducts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) })));
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const renderProduct = ({ item }: { item: Product }) => {
    const img =
      Array.isArray(item.images) && item.images.length > 0
        ? item.images[0]
        : "https://via.placeholder.com/150";
    const condS = CONDITION_COLOR[item.condition || ""] || CONDITION_COLOR["Used"];

    return (
      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.card }]}
        onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
        activeOpacity={0.85}
      >
        <View>
          <Image 
            source={{ uri: img }} 
            style={[s.cardImage, item.sold && { opacity: 0.5 }]} // تقليل شفافية الصورة لو مباع
          />
          
          {/* علامة المنتج المباع */}
          {item.sold && (
            <View style={s.soldBadge}>
              <Text style={s.soldText}>Sold</Text>
            </View>
          )}

          {item.condition && !item.sold && (
            <View style={[s.condBadge, { backgroundColor: condS.bg }]}>
              <Text style={[s.condText, { color: condS.text }]}>{item.condition}</Text>
            </View>
          )}
        </View>
        <View style={s.cardBody}>
          <Text 
            style={[s.cardTitle, { color: theme.text }, item.sold && { textDecorationLine: "line-through", color: "#94a3b8" }]} 
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[s.cardPrice, item.sold && { color: "#94a3b8" }]}>
            EGP {Number(item.price).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      {/* Back button */}
      <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={20} color={theme.text} />
      </TouchableOpacity>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={s.columnWrapper}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={[s.profileCard, { backgroundColor: theme.card }]}>
            {/* Avatar */}
            <Image
              source={{
                uri:
                  seller?.profilePhoto ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={s.avatar}
            />

            {/* Name */}
            <Text style={[s.name, { color: theme.text }]}>
              {seller?.firstName} {seller?.lastName}
            </Text>

            {/* Faculty badge */}
            {seller?.faculty && (
              <View style={s.facultyBadge}>
                <Text style={s.facultyText}>{seller.faculty}</Text>
              </View>
            )}

            {/* University */}
            {seller?.university && (
              <View style={s.uniRow}>
                <Feather name="map-pin" size={13} color="#2563eb" />
                <Text style={s.uniText}>{seller.university}</Text>
              </View>
            )}

            {/* Stats */}
            <View style={[s.statsRow, { borderTopColor: theme.background }]}>
              <View style={s.statItem}>
                <Text style={[s.statNum, { color: theme.text }]}>{products.length}</Text>
                <Text style={s.statLabel}>Listings</Text>
              </View>
              <View style={[s.statDivider, { backgroundColor: theme.background }]} />
              <View style={s.statItem}>
                <View style={s.verifiedRow}>
                  <Feather name="shield" size={14} color="#16a34a" />
                  <Text style={[s.statNum, { color: "#16a34a" }]}>Verified</Text>
                </View>
                <Text style={s.statLabel}>Member</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Feather name="package" size={36} color="#cbd5e1" />
            <Text style={{ color: "#94a3b8", marginTop: 8 }}>No listings yet</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  backBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  /* Profile card */
  profileCard: {
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
    marginBottom: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  facultyBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  facultyText: { fontSize: 12, color: "#2563eb", fontWeight: "600" },
  uniRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 16 },
  uniText: { fontSize: 13, color: "#64748b" },

  statsRow: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 4,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statNum: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 12, color: "#94a3b8" },
  statDivider: { width: 1, marginHorizontal: 8 },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 4 },

  /* Grid */
  columnWrapper: { paddingHorizontal: 16, gap: 12 },
  listContent: { paddingBottom: 40 },

  card: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: { width: "100%", aspectRatio: 1, resizeMode: "cover" },
  
  /* ستايل علامة المباع */
  soldBadge: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soldText: { color: "#fff", fontSize: 14, fontWeight: "bold" },

  condBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  condText: { fontSize: 10, fontWeight: "700" },
  cardBody: { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: "600", marginBottom: 3 },
  cardPrice: { fontSize: 14, fontWeight: "700", color: "#2563eb" },

  emptyWrap: { alignItems: "center", paddingTop: 40 },
});