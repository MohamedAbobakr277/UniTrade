import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, Image, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, Modal,
  TextInput, Animated, Pressable, KeyboardAvoidingView, Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../constants/ThemeContext";
import {
  doc, getDoc, collection, query, where, getDocs,
  setDoc, serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";

const { width } = Dimensions.get("window");

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
  status?: string;
};

type RatingData = {
  average: number;
  count: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  myRating: number | null;
  myComment: string;
};

const CONDITION_COLOR: Record<string, { bg: string; text: string }> = {
  New: { bg: "#dcfce7", text: "#166534" },
  "Like New": { bg: "#dbeafe", text: "#1e40af" },
  Good: { bg: "#fef9c3", text: "#854d0e" },
  Used: { bg: "#f1f5f9", text: "#475569" },
  Fair: { bg: "#fee2e2", text: "#991b1b" },
  Poor: { bg: "#fce7f3", text: "#9d174d" },
};

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

/* ─── Stars display ──────────────────────────────────────────────────── */
const Stars = ({
  value, size = 14, interactive = false, onSelect,
}: {
  value: number; size?: number; interactive?: boolean; onSelect?: (v: number) => void;
}) => (
  <View style={{ flexDirection: "row", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <TouchableOpacity key={i} disabled={!interactive} onPress={() => onSelect?.(i)} activeOpacity={0.7}>
        <Text style={{ fontSize: size, color: i <= Math.round(value) ? "#f59e0b" : "#d1d5db" }}>★</Text>
      </TouchableOpacity>
    ))}
  </View>
);

/* ─── Breakdown bars ─────────────────────────────────────────────────── */
const BreakdownBars = ({ breakdown, count }: { breakdown: RatingData["breakdown"]; count: number }) => (
  <View style={{ gap: 4, marginTop: 8 }}>
    {([5, 4, 3, 2, 1] as const).map((star) => {
      const pct = count > 0 ? (breakdown[star] / count) * 100 : 0;
      return (
        <View key={star} style={s.barRow}>
          <Text style={s.barLbl}>{star}</Text>
          <Text style={{ fontSize: 10, color: "#f59e0b" }}>★</Text>
          <View style={s.barBg}>
            <View style={[s.barFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={s.barCount}>{breakdown[star]}</Text>
        </View>
      );
    })}
  </View>
);

/* ─── Rating Submit Modal ────────────────────────────────────────────── */
const RatingModal = ({
  visible, sellerName, existingRating, existingComment, onClose, onSubmit,
}: {
  visible: boolean; sellerName: string;
  existingRating: number | null; existingComment: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}) => {
  const { theme } = useTheme();
  const [selected, setSelected] = useState(existingRating ?? 0);
  const [comment, setComment] = useState(existingComment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      setSelected(existingRating ?? 0);
      setComment(existingComment ?? "");
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    await onSubmit(selected, comment.trim());
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%" }}>
          <Animated.View
            style={[s.modalSheet, { backgroundColor: theme.card, transform: [{ translateY: slideAnim }] }]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={s.sheetHandle} />
              <Text style={[s.modalTitle, { color: theme.text }]}>
                {existingRating ? "Update your rating" : "Rate this seller"}
              </Text>
              <Text style={s.modalSub}>How was your experience with {sellerName}?</Text>

              <View style={{ alignItems: "center", marginVertical: 20 }}>
                <Stars value={selected} size={44} interactive onSelect={setSelected} />
                <Text style={[s.starLabel, { opacity: selected ? 1 : 0 }]}>
                  {STAR_LABELS[selected]}
                </Text>
              </View>

              <TextInput
                style={[s.commentInput, { color: theme.text, borderColor: "#e2e8f0", backgroundColor: theme.background }]}
                placeholder="Leave a comment (optional)..."
                placeholderTextColor="#94a3b8"
                multiline numberOfLines={3}
                value={comment}
                onChangeText={setComment}
              />

              <View style={s.modalBtns}>
                <TouchableOpacity style={s.btnCancel} onPress={onClose}>
                  <Text style={{ color: "#64748b", fontSize: 14, fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btnSubmit, { opacity: selected ? 1 : 0.45 }]}
                  onPress={handleSubmit}
                  disabled={!selected || submitting}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                        {existingRating ? "Update" : "Submit"}
                      </Text>}
                </TouchableOpacity>
              </View>
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

/* ─── Rating Input Card (مثل StarRatingInput في الويب) ───────────────── */
const RatingInputCard = ({
  ratingData, sellerName, onOpenModal,
}: {
  ratingData: RatingData; sellerName: string; onOpenModal: () => void;
}) => {
  const { theme } = useTheme();
  const hasRated = !!ratingData.myRating;

  return (
    <View style={[s.ratingInputCard, { backgroundColor: theme.card }]}>
      {/* Header */}
      <View style={s.ratingInputHeader}>
        <View style={s.ratingInputIconWrap}>
          <Text style={{ fontSize: 18 }}>⭐</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.ratingInputTitle, { color: theme.text }]}>
            {hasRated ? "Your Rating" : `Rate ${sellerName}`}
          </Text>
          <Text style={s.ratingInputSub}>
            {hasRated
              ? "You've already rated this seller"
              : "Share your experience with other students"}
          </Text>
        </View>
      </View>

      {/* Stars row */}
      <View style={s.ratingInputStarsRow}>
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = hasRated && i <= (ratingData.myRating ?? 0);
          return (
            <TouchableOpacity key={i} onPress={onOpenModal} activeOpacity={0.75}>
              <Text style={[
                s.ratingInputStar,
                filled ? s.ratingInputStarFilled : s.ratingInputStarEmpty,
              ]}>
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Label */}
      {hasRated ? (
        <View style={s.ratingInputRatedRow}>
          <View style={s.ratingInputRatedBadge}>
            <Feather name="check-circle" size={13} color="#16a34a" />
            <Text style={s.ratingInputRatedText}>
              Rated {ratingData.myRating}/5 — {STAR_LABELS[ratingData.myRating!]}
            </Text>
          </View>
          <TouchableOpacity onPress={onOpenModal} style={s.editRatingBtn}>
            <Feather name="edit-2" size={12} color="#2563eb" />
            <Text style={s.editRatingText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={s.ratingInputHint}>Tap a star to rate</Text>
      )}

      {/* Comment preview */}
      {hasRated && ratingData.myComment ? (
        <View style={[s.commentPreview, { backgroundColor: theme.background }]}>
          <Text style={{ fontSize: 11, color: "#64748b" }} numberOfLines={2}>
            "{ratingData.myComment}"
          </Text>
        </View>
      ) : null}
    </View>
  );
};

/* ─── Main Screen ────────────────────────────────────────────────────── */
export default function SellerProfile() {
  const { theme } = useTheme();
  const { sellerId } = useLocalSearchParams();
  const uid = Array.isArray(sellerId) ? sellerId[0] : sellerId;
  const currentUid = auth.currentUser?.uid;
  const isSelf = currentUid === uid;

  const [seller, setSeller] = useState<SellerUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState<RatingData>({
    average: 0, count: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    myRating: null, myComment: "",
  });
  const [showModal, setShowModal] = useState(false);

  const loadRatings = async () => {
    const snap = await getDocs(collection(db, "ratings", uid, "userRatings"));
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0, myRating: number | null = null, myComment = "";
    snap.forEach((d) => {
      const r = d.data().rating as number;
      if (r >= 1 && r <= 5) { breakdown[r] = (breakdown[r] || 0) + 1; total += r; }
      if (d.id === currentUid) { myRating = r; myComment = d.data().comment || ""; }
    });
    setRatingData({
      average: snap.size > 0 ? total / snap.size : 0,
      count: snap.size,
      breakdown: breakdown as RatingData["breakdown"],
      myRating, myComment,
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const uSnap = await getDoc(doc(db, "users", uid));
        if (uSnap.exists()) setSeller(uSnap.data() as SellerUser);
        const snap = await getDocs(query(collection(db, "products"), where("userId", "==", uid)));
        setProducts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) })));
        await loadRatings();
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    load();
  }, [uid]);

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!currentUid) return;
    await setDoc(doc(db, "ratings", uid, "userRatings", currentUid), {
      rating, comment, createdAt: serverTimestamp(),
    });
    await loadRatings();
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const sellerName = seller?.firstName ?? "Seller";
  const availableCount = products.filter((p) => p.status !== "sold").length;
  const soldCount = products.filter((p) => p.status === "sold").length;

  /* ── Profile Header ── */
  const ProfileHeader = () => (
    <View>
      {/* ── Seller info card ── */}
      <View style={[s.profileCard, { backgroundColor: theme.card }]}>
        <Image
          source={{ uri: seller?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
          style={s.avatar}
        />

        {/* Name + verified */}
        <View style={s.nameRow}>
          <Text style={[s.name, { color: theme.text }]}>
            {seller?.firstName} {seller?.lastName}
          </Text>
          <View style={s.verifiedBadge}>
            <Feather name="shield" size={12} color="#16a34a" />
            <Text style={s.verifiedText}>Verified</Text>
          </View>
        </View>

        {/* Faculty + University */}
        {seller?.faculty && (
          <View style={s.facultyBadge}>
            <Text style={s.facultyText}>{seller.faculty}</Text>
          </View>
        )}
        {seller?.university && (
          <View style={s.uniRow}>
            <Feather name="map-pin" size={12} color="#2563eb" />
            <Text style={s.uniText}>{seller.university}</Text>
          </View>
        )}

        {/* Rating summary */}
        {ratingData.count > 0 && (
          <View style={s.ratingPreviewRow}>
            <Stars value={ratingData.average} size={15} />
            <Text style={[s.ratingAvgBig, { color: theme.text }]}>
              {ratingData.average.toFixed(1)}
            </Text>
            <Text style={s.ratingCountSmall}>({ratingData.count} ratings)</Text>
          </View>
        )}

        {/* Stats */}
        <View style={[s.statsRow, { borderTopColor: theme.background }]}>
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: "#2563eb" }]}>{availableCount}</Text>
            <Text style={s.statLabel}>Available</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: theme.background }]} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: "#ef4444" }]}>{soldCount}</Text>
            <Text style={s.statLabel}>Sold</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: theme.background }]} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: theme.text }]}>{products.length}</Text>
            <Text style={s.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* ── Rating display card (if has ratings) ── */}
      {ratingData.count > 0 && (
        <View style={[s.ratingDisplayCard, { backgroundColor: theme.card }]}>
          <Text style={[s.ratingDisplayTitle, { color: theme.text }]}>Seller Ratings</Text>
          <View style={s.ratingDisplayBody}>
            {/* Big number */}
            <View style={s.ratingDisplayLeft}>
              <Text style={[s.ratingBigNum, { color: theme.text }]}>
                {ratingData.average.toFixed(1)}
              </Text>
              <Stars value={ratingData.average} size={16} />
              <Text style={s.ratingTotalTxt}>{ratingData.count} reviews</Text>
            </View>
            {/* Bars */}
            <View style={{ flex: 1 }}>
              <BreakdownBars breakdown={ratingData.breakdown} count={ratingData.count} />
            </View>
          </View>
        </View>
      )}

      {/* ── Rating input card (like web StarRatingInput) ── */}
      {!isSelf && currentUid && (
        <RatingInputCard
          ratingData={ratingData}
          sellerName={sellerName}
          onOpenModal={() => setShowModal(true)}
        />
      )}

      {/* Listings header */}
      <View style={s.listingsHeader}>
        <Text style={[s.listingsTitle, { color: theme.text }]}>Seller Listings</Text>
        <View style={s.listingsBadge}>
          <Text style={s.listingsBadgeText}>{products.length} items</Text>
        </View>
      </View>
    </View>
  );

  /* ── Product card ── */
  const renderProduct = ({ item }: { item: Product }) => {
    const img = Array.isArray(item.images) && item.images.length > 0
      ? item.images[0] : "https://via.placeholder.com/150";
    const condS = CONDITION_COLOR[item.condition || ""] || CONDITION_COLOR["Used"];

    return (
      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.card }]}
        onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
        activeOpacity={0.85}
      >
        <View>
          <Image source={{ uri: img }} style={[s.cardImage, item.status === "sold" && { opacity: 0.5 }]} />
          {item.status === "sold" && (
            <View style={s.soldBadge}><Text style={s.soldText}>Sold</Text></View>
          )}
          {item.condition && item.status !== "sold" && (
            <View style={[s.condBadge, { backgroundColor: condS.bg }]}>
              <Text style={[s.condText, { color: condS.text }]}>{item.condition}</Text>
            </View>
          )}
        </View>
        <View style={s.cardBody}>
          <Text
            style={[s.cardTitle, { color: theme.text },
              item.status === "sold" && { textDecorationLine: "line-through", color: "#94a3b8" }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[s.cardPrice, item.status === "sold" && { color: "#94a3b8" }]}>
            EGP {Number(item.price).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
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
        ListHeaderComponent={<ProfileHeader />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Feather name="package" size={36} color="#cbd5e1" />
            <Text style={{ color: "#94a3b8", marginTop: 8 }}>No listings yet</Text>
          </View>
        }
      />

      <RatingModal
        visible={showModal}
        sellerName={sellerName}
        existingRating={ratingData.myRating}
        existingComment={ratingData.myComment}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitRating}
      />
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  backBtn: {
    position: "absolute", top: 52, left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  /* Profile card */
  profileCard: {
    alignItems: "center", padding: 24, paddingTop: 64,
    borderRadius: 20, marginHorizontal: 16, marginTop: 16, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  name: { fontSize: 22, fontWeight: "800" },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#f0fdf4", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  verifiedText: { fontSize: 11, color: "#16a34a", fontWeight: "700" },
  facultyBadge: {
    backgroundColor: "#eff6ff", paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginBottom: 8,
  },
  facultyText: { fontSize: 12, color: "#2563eb", fontWeight: "600" },
  uniRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 12 },
  uniText: { fontSize: 13, color: "#64748b" },
  ratingPreviewRow: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12,
  },
  ratingAvgBig: { fontSize: 16, fontWeight: "800" },
  ratingCountSmall: { fontSize: 12, color: "#94a3b8" },
  statsRow: {
    flexDirection: "row", width: "100%",
    borderTopWidth: 1, paddingTop: 16, marginTop: 4,
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statNum: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  statDivider: { width: 1, marginHorizontal: 8 },

  /* Rating display card */
  ratingDisplayCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 20, padding: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  ratingDisplayTitle: {
    fontSize: 13, fontWeight: "700", textTransform: "uppercase",
    letterSpacing: 0.6, color: "#94a3b8", marginBottom: 12,
  },
  ratingDisplayBody: { flexDirection: "row", alignItems: "center", gap: 16 },
  ratingDisplayLeft: { alignItems: "center", gap: 4, width: 80 },
  ratingBigNum: { fontSize: 40, fontWeight: "800", lineHeight: 44 },
  ratingTotalTxt: { fontSize: 11, color: "#94a3b8", marginTop: 2 },

  /* Breakdown bars */
  barRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  barLbl: { fontSize: 11, color: "#64748b", width: 10, textAlign: "right" },
  barBg: {
    flex: 1, height: 6, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: "#f59e0b", borderRadius: 4 },
  barCount: { fontSize: 10, color: "#94a3b8", width: 18, textAlign: "right" },

  /* Rating input card */
  ratingInputCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 20,
    padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderWidth: 1.5, borderColor: "#eff6ff",
  },
  ratingInputHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  ratingInputIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#fef9c3", alignItems: "center", justifyContent: "center",
  },
  ratingInputTitle: { fontSize: 15, fontWeight: "700" },
  ratingInputSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  ratingInputStarsRow: {
    flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 12,
  },
  ratingInputStar: { fontSize: 38 },
  ratingInputStarFilled: { color: "#f59e0b" },
  ratingInputStarEmpty: { color: "#e2e8f0" },
  ratingInputHint: {
    textAlign: "center", fontSize: 12, color: "#94a3b8", marginBottom: 4,
  },
  ratingInputRatedRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 4,
  },
  ratingInputRatedBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#f0fdf4", paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 20,
  },
  ratingInputRatedText: { fontSize: 12, color: "#16a34a", fontWeight: "600" },
  editRatingBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: "#eff6ff", borderRadius: 20,
  },
  editRatingText: { fontSize: 12, color: "#2563eb", fontWeight: "600" },
  commentPreview: {
    marginTop: 8, padding: 10, borderRadius: 10,
    borderLeftWidth: 3, borderLeftColor: "#f59e0b",
  },

  /* Listings header */
  listingsHeader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  listingsTitle: { fontSize: 18, fontWeight: "800" },
  listingsBadge: {
    backgroundColor: "#eff6ff", paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  listingsBadgeText: { fontSize: 13, color: "#2563eb", fontWeight: "700" },

  /* Grid */
  columnWrapper: { paddingHorizontal: 16, gap: 12 },
  listContent: { paddingBottom: 40 },

  card: {
    flex: 1, borderRadius: 14, overflow: "hidden", marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardImage: { width: "100%", aspectRatio: 1, resizeMode: "cover" },
  soldBadge: {
    position: "absolute", top: "40%", alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8,
  },
  soldText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  condBadge: {
    position: "absolute", bottom: 8, left: 8,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  condText: { fontSize: 10, fontWeight: "700" },
  cardBody: { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: "600", marginBottom: 3 },
  cardPrice: { fontSize: 14, fontWeight: "700", color: "#2563eb" },
  emptyWrap: { alignItems: "center", paddingTop: 40 },

  /* Modal */
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: "#e2e8f0",
    borderRadius: 2, alignSelf: "center", marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  modalSub: { fontSize: 13, color: "#94a3b8", marginBottom: 4 },
  starLabel: { fontSize: 14, color: "#f59e0b", fontWeight: "700", marginTop: 10, height: 20 },
  commentInput: {
    borderWidth: 1, borderRadius: 12, padding: 12,
    fontSize: 14, minHeight: 80, textAlignVertical: "top", marginTop: 4,
  },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  btnCancel: {
    flex: 1, borderWidth: 1, borderColor: "#e2e8f0",
    borderRadius: 12, padding: 13, alignItems: "center",
  },
  btnSubmit: {
    flex: 2, backgroundColor: "#2563eb",
    borderRadius: 12, padding: 13, alignItems: "center",
  },
});