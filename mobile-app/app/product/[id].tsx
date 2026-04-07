import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Share,
  Modal,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../constants/ThemeContext";
import {
  doc, getDoc, collection, query, where,
  getDocs, addDoc, deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";

const { width } = Dimensions.get("window");

type Product = {
  id: string;
  title: string;
  price: number;
  description?: string;
  university?: string;
  condition?: string;
  category?: string;
  images?: string[];
  createdAt?: any;
  userId?: string;
  sellerName?: string;
  phone?: string;
  sold?: boolean;
};

function timeAgo(timestamp: any): string {
  if (!timestamp) return "";
  const seconds = Math.floor((Date.now() - timestamp.toDate().getTime()) / 1000);
  const h = Math.floor(seconds / 3600);
  if (h < 1) return Math.floor(seconds / 60) + " min ago";
  if (h < 24) return h + " h ago";
  return Math.floor(h / 24) + " d ago";
}

const CONDITION_COLOR: Record<string, { bg: string; text: string }> = {
  New: { bg: "#dcfce7", text: "#166534" },
  "Like New": { bg: "#dbeafe", text: "#1e40af" },
  Good: { bg: "#fef9c3", text: "#854d0e" },
  Used: { bg: "#f1f5f9", text: "#475569" },
  Fair: { bg: "#fee2e2", text: "#991b1b" },
};

export default function ProductDetails() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [sellerPhoto, setSellerPhoto] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState<Product[]>([]);

  /* ─── Fetch product ─── */
  useEffect(() => {
    const fetch = async () => {
      try {
        if (!id) return;
        const docId = Array.isArray(id) ? id[0] : id;
        const snap = await getDoc(doc(db, "products", docId));
        if (snap.exists()) {
          const data: any = snap.data();
          setProduct({ id: snap.id, ...data });
          if (data.userId) {
            setSellerId(data.userId);
            const uSnap = await getDoc(doc(db, "users", data.userId));
            if (uSnap.exists()) {
              const u: any = uSnap.data();
              setSellerPhoto(
                u.profilePhoto || u.photoURL || u.photo ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              );
              setSellerPhone(u.phoneNumber || u.phone || "");
            }
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  /* ─── Fetch recommended ─── */
  useEffect(() => {
    if (!product) return;
    const fetchRecommended = async () => {
      try {
        // query by category only — filter sold client-side to avoid composite index
        const snap = await getDocs(
          query(
            collection(db, "products"),
            where("category", "==", product.category ?? "")
          )
        );
        const results = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }))
          .filter((p) => p.id !== product.id && !p.sold)
          .slice(0, 6);

        // fallback: if same category has < 2 results, fetch recent products instead
        if (results.length < 2) {
          const fallback = await getDocs(
            query(collection(db, "products"), where("sold", "==", false))
          );
          const fallbackResults = fallback.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }))
            .filter((p) => p.id !== product.id)
            .slice(0, 6);
          setRecommended(fallbackResults);
        } else {
          setRecommended(results);
        }
      } catch (e) {
        console.log("recommended error:", e);
      }
    };
    fetchRecommended();
  }, [product]);

  /* ─── Check favourite ─── */
  useEffect(() => {
    const check = async () => {
      const user = auth.currentUser;
      if (!user || !product) return;
      const snap = await getDocs(query(
        collection(db, "favorites"),
        where("userId", "==", user.uid),
        where("productId", "==", product.id)
      ));
      setFavorite(!snap.empty);
    };
    check();
  }, [product]);

  const toggleFavorite = async () => {
    const user = auth.currentUser;
    if (!user || !product) return;
    const snap = await getDocs(query(
      collection(db, "favorites"),
      where("userId", "==", user.uid),
      where("productId", "==", product.id)
    ));
    if (snap.empty) {
      await addDoc(collection(db, "favorites"), { userId: user.uid, productId: product.id });
      setFavorite(true);
    } else {
      snap.forEach((d) => deleteDoc(d.ref));
      setFavorite(false);
    }
  };

  const shareProduct = () =>
    product && Share.share({ message: `${product.title} — EGP ${Number(product.price).toLocaleString()}` });

  const phone = sellerPhone || product?.phone || "";
  const openWhatsApp = () => {
    const cleaned = phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${cleaned}`);
  };
  const callSeller = () => Linking.openURL(`tel:${phone}`);
  const sendSMS = () => Linking.openURL(`sms:${phone}`);

  /* ─── States ─── */
  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={[{ color: theme.text, marginTop: 10, fontSize: 14 }]}>Loading…</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[s.center, { backgroundColor: theme.background }]}>
        <Feather name="alert-circle" size={40} color="#cbd5e1" />
        <Text style={{ color: theme.text, marginTop: 10 }}>Product not found</Text>
      </View>
    );
  }

  const images = product.images?.length ? product.images : ["https://via.placeholder.com/400"];
  const condStyle = CONDITION_COLOR[product.condition || ""] || CONDITION_COLOR["Used"];

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Image carousel ── */}
        <View style={s.imageWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) =>
              setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))
            }
            scrollEventThrottle={16}
          >
            {images.map((img, i) => (
              <TouchableOpacity key={i} activeOpacity={0.95} onPress={() => setZoom(true)}>
                <Image source={{ uri: img }} style={s.mainImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Dots */}
          {images.length > 1 && (
            <View style={s.dots}>
              {images.map((_, i) => (
                <View key={i} style={[s.dot, i === activeImage && s.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* ── Floating nav buttons ── */}
        <View style={s.floatingNav}>
          <TouchableOpacity style={s.navBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={s.navBtn} onPress={toggleFavorite}>
              <Feather name="heart" size={20} color={favorite ? "#ef4444" : "#fff"} />
            </TouchableOpacity>
            <TouchableOpacity style={s.navBtn} onPress={shareProduct}>
              <Feather name="share-2" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Content ── */}
        <View style={s.content}>

          {/* Price + badges */}
          <View style={s.topRow}>
            <Text style={[s.price, { color: theme.text }]}>
              EGP {Number(product.price).toLocaleString()}
            </Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {product.condition && (
                <View style={[s.badge, { backgroundColor: condStyle.bg }]}>
                  <Text style={[s.badgeText, { color: condStyle.text }]}>
                    {product.condition}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text style={[s.title, { color: theme.text }]}>{product.title}</Text>

          {/* Meta row */}
          <View style={s.metaRow}>
            {product.university && (
              <View style={s.metaChip}>
                <Feather name="map-pin" size={12} color="#2563eb" />
                <Text style={s.metaChipText}>{product.university}</Text>
              </View>
            )}
            {product.category && (
              <View style={s.metaChip}>
                <Feather name="tag" size={12} color="#2563eb" />
                <Text style={s.metaChipText}>{product.category}</Text>
              </View>
            )}
            <Text style={s.timeText}>{timeAgo(product.createdAt)}</Text>
          </View>

          {/* Divider */}
          <View style={[s.divider, { backgroundColor: theme.card }]} />

          {/* Description */}
          {product.description ? (
            <>
              <Text style={[s.sectionLabel, { color: theme.text }]}>Description</Text>
              <Text style={[s.description, { color: theme.text }]}>
                {product.description}
              </Text>
            </>
          ) : null}

          {/* Divider */}
          <View style={[s.divider, { backgroundColor: theme.card }]} />

          {/* Seller card */}
          <Text style={[s.sectionLabel, { color: theme.text }]}>Seller</Text>
          <TouchableOpacity
            style={[s.sellerCard, { backgroundColor: theme.card }]}
            onPress={() => sellerId && router.push({ pathname: "/seller/[sellerId]", params: { sellerId } })}
            activeOpacity={0.8}
          >
            <Image source={{ uri: sellerPhoto }} style={s.sellerAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={[s.sellerName, { color: theme.text }]}>
                {product.sellerName || "Unknown"}
              </Text>
              <Text style={s.sellerSub}>Member • UniTrade</Text>
            </View>
            <View style={s.sellerBadge}>
              <Feather name="shield" size={13} color="#16a34a" />
              <Text style={s.sellerBadgeText}>Verified</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* Recommended */}
          {recommended.length > 0 && (
            <>
              <View style={[s.divider, { backgroundColor: theme.card }]} />
              <Text style={[s.sectionLabel, { color: theme.text }]}>You May Also Like</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
              >
                {recommended.map((item) => {
                  const img =
                    Array.isArray(item.images) && item.images.length > 0
                      ? item.images[0]
                      : "https://via.placeholder.com/150";
                  const condS = CONDITION_COLOR[item.condition || ""] || CONDITION_COLOR["Used"];
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[s.recCard, { backgroundColor: theme.card }]}
                      onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: img }} style={s.recImage} />
                      {item.condition && (
                        <View style={[s.recBadge, { backgroundColor: condS.bg }]}>
                          <Text style={[s.recBadgeText, { color: condS.text }]}>{item.condition}</Text>
                        </View>
                      )}
                      <View style={s.recBody}>
                        <Text style={[s.recTitle, { color: theme.text }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={s.recPrice}>EGP {Number(item.price).toLocaleString()}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Contact bar ── */}
      <View style={[s.contactBar, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={[s.contactBtn, s.whatsappBtn]} onPress={openWhatsApp}>
          <Feather name="message-circle" size={18} color="#fff" />
          <Text style={s.contactText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.contactBtn, s.smsBtn]} onPress={sendSMS}>
          <Feather name="mail" size={18} color="#2563eb" />
          <Text style={[s.contactText, { color: "#2563eb" }]}>SMS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.contactBtn, s.callBtn]} onPress={callSeller}>
          <Feather name="phone" size={18} color="#fff" />
          <Text style={s.contactText}>Call</Text>
        </TouchableOpacity>
      </View>

      {/* ── Zoom modal ── */}
      <Modal visible={zoom} transparent>
        <TouchableOpacity style={s.zoomModal} activeOpacity={1} onPress={() => setZoom(false)}>
          <Image source={{ uri: images[activeImage] }} style={s.zoomImage} />
          <View style={s.zoomClose}>
            <Feather name="x" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* Image */
  imageWrap: { width, height: 400, backgroundColor: "#000" },
  mainImage: { width, height: 400, resizeMode: "contain" },
  dots: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 18,
  },

  /* Nav */
  floatingNav: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  navBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Content */
  content: { padding: 20 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  price: { fontSize: 26, fontWeight: "800" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 12, lineHeight: 26 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  metaChipText: { fontSize: 12, color: "#1e40af", fontWeight: "500" },
  timeText: { fontSize: 12, color: "#94a3b8", marginLeft: "auto" },

  divider: { height: 1, marginVertical: 16, borderRadius: 1 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#94a3b8",
    marginBottom: 10,
  },
  description: { fontSize: 15, lineHeight: 24, color: "#475569" },

  /* Seller */
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24 },
  sellerName: { fontSize: 15, fontWeight: "600" },
  sellerSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  sellerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sellerBadgeText: { fontSize: 11, color: "#16a34a", fontWeight: "600" },

  /* Contact bar */
  contactBar: {
    position: "absolute",
    bottom: 0,
    width,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  whatsappBtn: { backgroundColor: "#22c55e" },
  smsBtn: { backgroundColor: "#eff6ff", borderWidth: 1.5, borderColor: "#bfdbfe" },
  callBtn: { backgroundColor: "#2563eb" },
  contactText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  /* Recommended */
  recCard: {
    width: 150,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  recImage: { width: 150, height: 130, resizeMode: "cover" },
  recBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recBadgeText: { fontSize: 10, fontWeight: "700" },
  recBody: { padding: 10 },
  recTitle: { fontSize: 13, fontWeight: "600", marginBottom: 3 },
  recPrice: { fontSize: 13, fontWeight: "700", color: "#2563eb" },

  /* Zoom */
  zoomModal: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  zoomImage: { width: "100%", height: "100%", resizeMode: "contain" },
  zoomClose: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});