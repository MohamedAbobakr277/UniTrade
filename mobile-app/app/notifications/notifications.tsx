import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, query, orderBy, onSnapshot, doc, writeBatch } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useTheme } from "../../constants/ThemeContext";

type Notification = {
  id: string;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: any;
};

function timeAgo(date: Date): string {
  if (!date) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme, darkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "users", uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Notification[];
      setNotifications(notifs);
      setLoading(false);
      
      // Mark all as read when viewed
      const unread = notifs.filter(n => !n.read);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach(n => {
          batch.update(doc(db, "users", uid, "notifications", n.id), { read: true });
        });
        batch.commit().catch(console.error);
      }
    });

    return () => unsub();
  }, []);

  const handlePress = (item: Notification) => {
    if (item.link) {
      if (item.link.startsWith("/item/")) {
         router.push({ pathname: "/product/[id]", params: { id: item.link.split("/item/")[1] } });
      } else if (item.link.startsWith("/seller/")) {
         router.push({ pathname: "/seller/[sellerId]", params: { sellerId: item.link.split("/seller/")[1] } });
      }
    }
  };

  const border = darkMode ? "#1e293b" : "#e2e8f0";

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      <View style={[s.header, { borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Feather name="bell-off" size={40} color="#94a3b8" />
              <Text style={[s.emptyText, { color: theme.text }]}>No notifications yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[s.card, { backgroundColor: item.read ? theme.card : (darkMode ? "#1e293b" : "#eff6ff") }]}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
            >
              <View style={s.iconWrap}>
                <Feather 
                  name={item.type === "rating" ? "star" : item.type === "favorite" ? "heart" : "bell"} 
                  size={18} 
                  color={item.type === "rating" ? "#f59e0b" : item.type === "favorite" ? "#ef4444" : "#2563eb"} 
                />
              </View>
              <View style={s.content}>
                <Text style={[s.message, { color: theme.text, fontWeight: item.read ? "500" : "700" }]}>
                  {item.message}
                </Text>
                <Text style={s.time}>{item.createdAt ? timeAgo(item.createdAt.toDate()) : ""}</Text>
              </View>
              {!item.read && <View style={s.unreadDot} />}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: { alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 16, marginTop: 12, fontWeight: "500" },
  card: {
    flexDirection: "row", padding: 16, borderRadius: 12, marginBottom: 12,
    alignItems: "center"
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center", justifyContent: "center", marginRight: 12
  },
  content: { flex: 1 },
  message: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  time: { fontSize: 12, color: "#94a3b8" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563eb", marginLeft: 8 }
});
