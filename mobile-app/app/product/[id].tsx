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
  Alert,
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

function timeAgo(timestamp: any): string {
  if (!timestamp) return "";
  const seconds = Math.floor((Date.now() - timestamp.toDate().getTime()) / 1000);
  const h = Math.floor(seconds / 3600);
  if (h < 1) return Math.floor(seconds / 60) + " min ago";
  if (h < 24) return h + " h ago";
  return Math.floor(h / 24) + " d ago";
}

const CONDITION_COLOR: Record<string, { bg: string; text: string }> = {
  New: { bg: "#dcfce7", text: "#6e8d7a" },
  "Like New": { bg: "#dbeafe", text: "#1e40af" },
  Good: { bg: "#fef9c3", text: "#854d0e" },
  Used: { bg: "#f1f5f9", text: "#475569" },
  Fair: { bg: "#fee2e2", text: "#991b1b" },
};

export default function ProductDetails() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();

  const [product, setProduct] = useState<any>(null);
  const [sellerPhoto, setSellerPhoto] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const docId = Array.isArray(id) ? id[0] : id;
        const snap = await getDoc(doc(db, "products", docId));
        
        if (snap.exists()) {
          const data: any = snap.data();
          setProduct({ id: snap.id, ...data });
          
          if (data.userId) {
            const uSnap = await getDoc(doc(db, "users", data.userId));
            if (uSnap.exists()) {
              const u: any = uSnap.data();
              const phone = u.phone || u.phoneNumber || data.phone || "";
              setSellerPhone(String(phone));
              setSellerPhoto(
                u.profilePhoto || u.photoURL || u.photo ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              );
            }
          }
        }
      } catch (e) {
        console.error("Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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

  const shareProduct = () => {
    if (product) {
      Share.share({ message: `${product.title} — EGP ${Number(product.price).toLocaleString()}` });
    }
  };

  const callSeller = () => {
    if (!sellerPhone || sellerPhone.trim() === "" || sellerPhone === "undefined") {
      Alert.alert("Contact Info", "Seller phone number not found.");
      return;
    }
    Linking.openURL(`tel:${sellerPhone}`);
  };

  const openWhatsApp = async () => {
    if (!product || !sellerPhone || sellerPhone.trim() === "" || sellerPhone === "undefined") {
      Alert.alert("Contact Info", "WhatsApp number not available.");
      return;
    }

    let cleanPhone = sellerPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "2" + cleanPhone;
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith("1")) {
      cleanPhone = "20" + cleanPhone;
    }

    // Professional Message Formatting
    const message = 
      `Hi! 👋\n\n` +
      `I'm interested in your listing on UniTrade:\n\n` +
      `📦 *${product.title}*\n` +
      `💰 Price: EGP ${Number(product.price).toLocaleString()}\n` +
      `✅ Condition: ${product.condition || "N/A"}\n` +
      `📍 University: ${product.university || "N/A"}\n\n` +
      `Is it still available?`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "WhatsApp is not installed.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not open WhatsApp.");
    }
  };

  const openChat = () => {
    if (!product || !auth.currentUser) {
      router.push("/");
      return;
    }
    const ids = [auth.currentUser.uid, product.userId].sort();
    const chatId = `${ids[0]}_${ids[1]}_${product.id}`;
    router.push({
      pathname: "/chat/[chatId]",
      params: {
        chatId,
        sellerId: product.userId,
        sellerName: product.sellerName || "Seller",
        sellerPhoto,
        productId: product.id,
        productTitle: product.title,
        productPrice: String(product.price),
        productImage: product.images?.[0] || "",
      },
    });
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : ["https://via.placeholder.com/400"];
  const condStyle = CONDITION_COLOR[product.condition || ""] || CONDITION_COLOR["Used"];

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.imageWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}
          >
            {images.map((img: string, i: number) => (
              <TouchableOpacity key={i} activeOpacity={0.95} onPress={() => setZoom(true)}>
                <Image source={{ uri: img }} style={s.mainImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {images.length > 1 && (
            <View style={s.dots}>
              {images.map((_: any, i: number) => (
                <View key={i} style={[s.dot, i === activeImage && s.dotActive]} />
              ))}
            </View>
          )}

          <View style={s.imageCounter}>
            <Text style={s.imageCounterText}>{activeImage + 1} / {images.length}</Text>
          </View>
        </View>

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

        <View style={s.content}>
          <View style={s.topRow}>
            <Text style={[s.price, { color: theme.text }]}>EGP {Number(product.price).toLocaleString()}</Text>
            {product.condition && (
              <View style={[s.badge, { backgroundColor: condStyle.bg }]}>
                <Text style={[s.badgeText, { color: condStyle.text }]}>{product.condition}</Text>
              </View>
            )}
          </View>

          <Text style={[s.title, { color: theme.text }]}>{product.title}</Text>

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

          <View style={[s.divider, { backgroundColor: theme.card }]} />
          
          <Text style={[s.sectionLabel, { color: theme.text }]}>Description</Text>
          <Text style={[s.description, { color: theme.text }]}>{product.description}</Text>

          <View style={[s.divider, { backgroundColor: theme.card }]} />

          <Text style={[s.sectionLabel, { color: theme.text }]}>Seller</Text>
          <View style={[s.sellerCard, { backgroundColor: theme.card }]}>
            <Image source={{ uri: sellerPhoto }} style={s.sellerAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={[s.sellerName, { color: theme.text }]}>{product.sellerName || "Unknown"}</Text>
              <Text style={{ color: "#94a3b8", fontSize: 12 }}>Member • UniTrade</Text>
            </View>
            <View style={s.sellerBadge}>
              <Feather name="shield" size={13} color="#16a34a" />
              <Text style={s.sellerBadgeText}>Verified</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={[s.contactBar, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={[s.contactBtn, s.chatBtn]} onPress={openChat}>
          <Feather name="message-square" size={18} color="#fff" />
          <Text style={s.contactText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.contactBtn, s.callBtn]} onPress={callSeller}>
          <Feather name="phone" size={18} color="#fff" />
          <Text style={s.contactText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.contactBtn, s.whatsappBtn]} onPress={openWhatsApp}>
          <Feather name="message-circle" size={18} color="#fff" />
          <Text style={s.contactText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={zoom} transparent>
        <TouchableOpacity style={s.zoomModal} activeOpacity={1} onPress={() => setZoom(false)}>
          <Image source={{ uri: images[activeImage] }} style={s.zoomImage} />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageWrap: { width, height: 400, backgroundColor: "#000" },
  mainImage: { width, height: 400, resizeMode: "contain" },
  dots: { position: "absolute", bottom: 14, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.45)" },
  dotActive: { backgroundColor: "#fff", width: 18 },
  imageCounter: { position: "absolute", bottom: 14, right: 14, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  imageCounterText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  floatingNav: { position: "absolute", top: 50, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", zIndex: 10 },
  navBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  content: { padding: 20 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  price: { fontSize: 26, fontWeight: "800" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#eff6ff", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  metaChipText: { fontSize: 12, color: "#1e40af", fontWeight: "500" },
  timeText: { fontSize: 12, color: "#94a3b8", marginLeft: "auto" },
  divider: { height: 1, marginVertical: 16 },
  sectionLabel: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 24 },
  sellerCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, gap: 12 },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24 },
  sellerName: { fontSize: 15, fontWeight: "600" },
  sellerBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f0fdf4", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  sellerBadgeText: { fontSize: 11, color: "#16a34a", fontWeight: "600" },
  contactBar: { position: "absolute", bottom: 0, width, flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  contactBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderRadius: 12 },
  chatBtn: { backgroundColor: "#2563eb" },
  callBtn: { backgroundColor: "#0f172a" },
  whatsappBtn: { backgroundColor: "#22c55e" },
  contactText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  zoomModal: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  zoomImage: { width: "100%", height: "100%", resizeMode: "contain" },
});