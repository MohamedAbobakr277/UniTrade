import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useTheme } from "../../constants/ThemeContext";

type NotificationType = "rating" | "favorite" | "discount" | "sold" | string;

type RawNotification = {
  id: string;
  type: NotificationType;
  message: string;
  link?: string;
  /** Firestore field may be "read" or "isRead" – we normalise both */
  read?: boolean;
  isRead?: boolean;
  createdAt: any;
};

/** Normalised shape used for rendering */
type Notification = RawNotification & { _isRead: boolean };

/** Map type → icon, accent color, pill background */
const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  rating:   { icon: "star",         color: "#f59e0b", bg: "#fef3c7" },
  favorite: { icon: "heart",        color: "#ef4444", bg: "#fee2e2" },
  discount: { icon: "tag",          color: "#8b5cf6", bg: "#ede9fe" },
  sold:     { icon: "check-circle", color: "#16a34a", bg: "#dcfce7" },
  default:  { icon: "bell",         color: "#2563eb", bg: "#dbeafe" },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META.default;
}

/** Resolve whichever boolean field exists on the document */
function resolveRead(doc: RawNotification): boolean {
  if (typeof doc.isRead === "boolean") return doc.isRead;
  if (typeof doc.read === "boolean") return doc.read;
  return false; // undefined → treat as unread
}

function timeAgo(date: Date): string {
  if (!date) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  return date.toLocaleDateString();
}

/* ─── Animated card ───────────────────────────────────────── */
function NotifCard({
  item,
  onPress,
  theme,
  darkMode,
  index,
}: {
  item: Notification;
  onPress: () => void;
  theme: any;
  darkMode: boolean;
  index: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const meta = getTypeMeta(item.type);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      delay: Math.min(index * 35, 400), // cap delay so long lists feel snappy
      useNativeDriver: true,
    }).start();
  }, []);

  // _isRead = what it was when the screen first loaded (frozen snapshot)
  const isUnread = !item._isRead;

  const cardBg = isUnread
    ? darkMode
      ? "#0f2a4a"   // dark-mode unread: deep navy
      : "#eff6ff"   // light-mode unread: soft blue
    : theme.card;   // read: neutral card

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [14, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={[s.card, { backgroundColor: cardBg }, isUnread && s.cardUnread]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {/* Colored icon bubble */}
        <View style={[s.iconWrap, { backgroundColor: meta.bg }]}>
          <Feather name={meta.icon as any} size={18} color={meta.color} />
        </View>

        {/* Message + meta row */}
        <View style={s.content}>
          <Text
            style={[
              s.message,
              {
                color: theme.text,
                fontWeight: isUnread ? "600" : "400",
                opacity: isUnread ? 1 : 0.8,
              },
            ]}
            numberOfLines={3}
          >
            {item.message}
          </Text>

          <View style={s.metaRow}>
            <Feather
              name="clock"
              size={11}
              color="#94a3b8"
              style={{ marginRight: 4 }}
            />
            <Text style={s.time}>
              {item.createdAt ? timeAgo(item.createdAt.toDate()) : ""}
            </Text>

            {/* NEW pill — only on unread */}
            {isUnread && (
              <View style={s.newPill}>
                <Text style={s.newPillText}>NEW</Text>
              </View>
            )}
          </View>
        </View>

        {/* Blue dot — only on unread */}
        {isUnread && <View style={s.unreadDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─── Screen ──────────────────────────────────────────────── */
export default function NotificationsScreen() {
  const router = useRouter();
  const { theme, darkMode } = useTheme();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * KEY FIX: We store the IDs that were unread when the screen FIRST loaded.
   * After we mark them read in Firestore the snapshot fires again, but we
   * keep rendering them as "unread" so the user can see what's new.
   * On the NEXT visit everything is already read in Firestore → set is empty.
   */
  const initialUnreadIds = useRef<Set<string>>(new Set());
  const hasFirstLoad = useRef(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "users", uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const raw = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<RawNotification, "id">),
      })) as RawNotification[];

      // ── First snapshot only: freeze the unread IDs ──────────
      if (!hasFirstLoad.current) {
        hasFirstLoad.current = true;
        raw.forEach((n) => {
          if (!resolveRead(n)) initialUnreadIds.current.add(n.id);
        });

        // Delay mark-as-read so the unread UI is visible to the user
        const unread = raw.filter((n) => !resolveRead(n));
        if (unread.length > 0) {
          setTimeout(() => {
            const batch = writeBatch(db);
            unread.forEach((n) => {
              const ref = doc(db, "users", uid, "notifications", n.id);
              // Write both field names for full compatibility
              batch.update(ref, { read: true, isRead: true });
            });
            batch.commit().catch(console.error);
          }, 1500); // 1.5 s grace period — user can clearly see unread state
        }
      }

      // Attach frozen _isRead based on our first-load set
      const normalised: Notification[] = raw.map((n) => ({
        ...n,
        _isRead: !initialUnreadIds.current.has(n.id),
      }));

      setNotifications(normalised);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handlePress = (item: Notification) => {
    if (!item.link) return;
    if (item.link.startsWith("/item/") || item.link.startsWith("/product/")) {
      const id = item.link.split("/").pop();
      router.push({ pathname: "/product/[id]", params: { id } });
    } else if (item.link.startsWith("/seller/")) {
      const sellerId = item.link.split("/seller/")[1];
      router.push({ pathname: "/seller/[sellerId]", params: { sellerId } });
    }
  };

  const unreadCount = notifications.filter((n) => !n._isRead).length;
  const border = darkMode ? "#1e293b" : "#e2e8f0";

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      {/* ── Header ── */}
      <View style={[s.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={theme.text} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={[s.title, { color: theme.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={s.headerBadge}>
              <Text style={s.headerBadgeText}>
                {unreadCount} unread
              </Text>
            </View>
          )}
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* ── Body ── */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={[s.loadingText, { color: "#94a3b8" }]}>
            Loading notifications…
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            notifications.length > 0 ? (
              <Text style={[s.sectionLabel, { color: darkMode ? "#475569" : "#94a3b8" }]}>
                {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={s.emptyState}>
              <View
                style={[
                  s.emptyIconCircle,
                  { backgroundColor: darkMode ? "#1e293b" : "#f1f5f9" },
                ]}
              >
                <Feather name="bell-off" size={36} color="#94a3b8" />
              </View>
              <Text style={[s.emptyTitle, { color: theme.text }]}>
                All caught up!
              </Text>
              <Text style={s.emptySubtitle}>
                No notifications yet. Activity like favorites, ratings, and
                discounts will appear here.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <NotifCard
              item={item}
              onPress={() => handlePress(item)}
              theme={theme}
              darkMode={darkMode}
              index={index}
            />
          )}
        />
      )}
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const s = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "700" },
  headerBadge: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  headerBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14 },

  listContent: { padding: 16, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 12,
  },

  /* Card */
  card: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  /** Unread gets a prominent left accent border */
  cardUnread: {
    borderLeftWidth: 3.5,
    borderLeftColor: "#2563eb",
  },

  /* Icon bubble */
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },

  /* Text area */
  content: { flex: 1 },
  message: { fontSize: 14, lineHeight: 21, marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center" },
  time: { fontSize: 12, color: "#94a3b8" },

  /* "NEW" pill */
  newPill: {
    marginLeft: 8,
    backgroundColor: "#dbeafe",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newPillText: { color: "#1d4ed8", fontSize: 10, fontWeight: "700" },

  /* Blue dot */
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#2563eb",
    marginLeft: 10,
    marginTop: 5,
    flexShrink: 0,
  },

  /* Empty state */
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
