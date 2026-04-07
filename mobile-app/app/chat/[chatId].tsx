import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../constants/ThemeContext";
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
  status?: string;
};

export default function ChatScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const chatId      = Array.isArray(params.chatId)       ? params.chatId[0]       : params.chatId       || "";
  const sellerId    = Array.isArray(params.sellerId)      ? params.sellerId[0]      : params.sellerId      || "";
  const sellerName  = Array.isArray(params.sellerName)    ? params.sellerName[0]    : params.sellerName    || "Seller";
  const sellerPhoto = Array.isArray(params.sellerPhoto)   ? params.sellerPhoto[0]   : params.sellerPhoto   || "";
  const productId    = Array.isArray(params.productId)    ? params.productId[0]     : params.productId     || "";
  const productTitle = Array.isArray(params.productTitle) ? params.productTitle[0]  : params.productTitle  || "";
  const productPrice = Array.isArray(params.productPrice) ? params.productPrice[0]  : params.productPrice  || "";
  const productImage = Array.isArray(params.productImage) ? params.productImage[0]  : params.productImage  || "";

  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!currentUser || !chatId) return;

    const ensureChat = async () => {
      const chatRef = doc(db, "chats", chatId);
      const snap = await getDoc(chatRef);
      if (!snap.exists()) {
        await setDoc(chatRef, {
          participants: [currentUser.uid, sellerId],
          productId,
          productTitle,
          productPrice,
          productImage,
          sellerName,
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
        });
      }
    };
    ensureChat();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">),
      }));
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return unsub;
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const markSeen = async () => {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const snapshot = await getDocs(messagesRef);

      snapshot.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (data.senderId !== currentUser.uid && data.status !== "seen") {
          await updateDoc(docSnap.ref, {
            status: "seen",
          });
        }
      });
    };

    markSeen();
  }, [chatId]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || !currentUser) return;
    setText("");

    const messagesRef = collection(db, "chats", chatId, "messages");
    await addDoc(messagesRef, {
      text: trimmed,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
      status: "sent",
    });

    await setDoc(
      doc(db, "chats", chatId),
      { lastMessage: trimmed, lastMessageAt: serverTimestamp() },
      { merge: true }
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUser?.uid;
    return (
      <View style={[s.bubbleRow, isMe ? s.bubbleRowMe : s.bubbleRowThem]}>
        {!isMe && (
          <Image
            source={{ uri: sellerPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
            style={s.bubbleAvatar}
          />
        )}
        <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
          <Text style={[s.bubbleText, isMe ? s.bubbleTextMe : s.bubbleTextThem]}>
            {item.text}
          </Text>

          {isMe && (
            <Text style={{ fontSize: 10, color: "#cbd5e1", marginTop: 4 }}>
              {item.status === "seen" ? "Seen" : "Sent"}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[s.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" />

      <View style={[s.header, { backgroundColor: theme.background, borderBottomColor: theme.card }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </TouchableOpacity>

        <Image
          source={{ uri: sellerPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
          style={s.headerAvatar}
        />

        <View style={{ flex: 1 }}>
          <Text style={[s.headerName, { color: theme.text }]} numberOfLines={1}>
            {sellerName}
          </Text>
          <Text style={s.headerSub} numberOfLines={1}>UniTrade Member</Text>
        </View>
      </View>

      {productTitle ? (
        <View style={[s.productCard, { backgroundColor: theme.card }]}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={s.productThumb} />
          ) : (
            <View style={[s.productThumb, s.productThumbPlaceholder]}>
              <Feather name="package" size={18} color="#94a3b8" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[s.productTitle, { color: theme.text }]} numberOfLines={1}>
              {productTitle}
            </Text>
            <Text style={s.productPrice}>
              EGP {Number(productPrice).toLocaleString()}
            </Text>
          </View>
          <View style={s.productBadge}>
            <Text style={s.productBadgeText}>Listing</Text>
          </View>
        </View>
      ) : null}

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={s.messagesList}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Feather name="message-circle" size={40} color="#cbd5e1" />
              <Text style={s.emptyText}>No messages yet</Text>
              <Text style={s.emptySubText}>Say hi to start the conversation!</Text>
            </View>
          }
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <View style={[s.inputBar, { backgroundColor: theme.background, borderTopColor: theme.card }]}>
        <TextInput
          style={[s.input, { backgroundColor: theme.card, color: theme.text }]}
          placeholder="Type a message…"
          placeholderTextColor="#94a3b8"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[s.sendBtn, text.trim() ? s.sendBtnActive : s.sendBtnInactive]}
          onPress={sendMessage}
          disabled={!text.trim()}
        >
          <Feather name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 56 : 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerName: { fontSize: 16, fontWeight: "700" },
  headerSub: { fontSize: 12, color: "#94a3b8", marginTop: 1 },

  productCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  productThumb: {
    width: 44, height: 44, borderRadius: 8,
    resizeMode: "cover",
  },
  productThumbPlaceholder: {
    backgroundColor: "#f1f5f9",
    alignItems: "center", justifyContent: "center",
  },
  productTitle: { fontSize: 13, fontWeight: "600" },
  productPrice: { fontSize: 12, color: "#2563eb", fontWeight: "700", marginTop: 2 },
  productBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  productBadgeText: { fontSize: 11, color: "#2563eb", fontWeight: "600" },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  messagesList: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#94a3b8", marginTop: 12 },
  emptySubText: { fontSize: 13, color: "#cbd5e1", marginTop: 4 },

  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    gap: 8,
  },
  bubbleRowMe: { justifyContent: "flex-end" },
  bubbleRowThem: { justifyContent: "flex-start" },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14, marginBottom: 2 },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: "#f1f5f9",
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextMe: { color: "#fff" },
  bubbleTextThem: { color: "#1e293b" },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    gap: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 120,
    lineHeight: 22,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  sendBtnActive: { backgroundColor: "#2563eb" },
  sendBtnInactive: { backgroundColor: "#cbd5e1" },
});