import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
  Modal,
  Keyboard,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../constants/ThemeContext";
import { auth, db } from "../app/services/firebase";
import { doc, getDoc } from "firebase/firestore";

const BACKEND_URL = "http://192.168.1.9:3000";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const BUTTON_SIZE = 60;
const BUTTON_RIGHT_MARGIN = 16;
const TOP_BOUND = 100;
const BOTTOM_BOUND = SCREEN_HEIGHT - 160;

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
};

/* ─── Animated typing dots ─────────────────────────────────────────────────── */
function TypingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(dot, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(540 - i * 180),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 7, height: 7, borderRadius: 4,
            backgroundColor: "#2563eb",
            opacity: dot,
            transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
          }}
        />
      ))}
    </View>
  );
}

/* ─── Pulse animation ring ─────────────────────────────────────────────────── */
function PulseRing({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.8, duration: 1400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        borderWidth: 2,
        borderColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function FloatingChatbot() {
  const { theme, darkMode } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  // Draggable position
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - BUTTON_SIZE - BUTTON_RIGHT_MARGIN, y: SCREEN_HEIGHT / 2 - 100 })).current;
  const panValue = useRef({ x: SCREEN_WIDTH - BUTTON_SIZE - BUTTON_RIGHT_MARGIN, y: SCREEN_HEIGHT / 2 - 100 });

  useEffect(() => {
    const sub = pan.addListener((value) => { panValue.current = value; });
    return () => pan.removeListener(sub);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > 4 || Math.abs(dy) > 4,
      onPanResponderGrant: () => {
        pan.setOffset({ x: panValue.current.x, y: panValue.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // Snap to closest edge horizontally
        const horizontalSnap = panValue.current.x > (SCREEN_WIDTH - BUTTON_SIZE) / 2
          ? SCREEN_WIDTH - BUTTON_SIZE - BUTTON_RIGHT_MARGIN
          : BUTTON_RIGHT_MARGIN;

        const verticalClamped = Math.max(TOP_BOUND, Math.min(BOTTOM_BOUND, panValue.current.y));

        Animated.spring(pan, {
          toValue: { x: horizontalSnap, y: verticalClamped },
          useNativeDriver: true,
          tension: 60,
          friction: 10
        }).start();
      },
    })
  ).current;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState("Student");
  const [user, setUser] = useState(auth.currentUser);
  const [keyboardHeight, setKeyboardHeight] = useState(0);


  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Track auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  // Load user name
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setUserName(d.firstName || d.name || "Student");
      }
    });
  }, []);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 && userName) {
      setMessages([{ id: 1, text: `Hi ${userName}! 👋 I'm UniTrade AI. Ask me anything!`, sender: "ai" }]);
    }
  }, [userName]);

  /* ─── Keyboard listeners (WhatsApp-style) ─── */
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Scroll to bottom when keyboard opens
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const onHide = () => {
      setKeyboardHeight(0);
    };

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const openChat = () => {
    setIsOpen(true);
    Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };

  const closeChat = () => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setIsOpen(false));
  };

  // ─── Inactivity Reminder ───
  useEffect(() => {
    // Only run if the chat is open and AI is not currently responding
    if (!isOpen || isTyping) return;

    const timer = setTimeout(() => {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        // Avoid duplicate reminder messages
        if (lastMsg && lastMsg.text === "How can I help you?") return prev;
        return [
          ...prev,
          { id: Date.now(), text: "How can I help you?", sender: "ai" },
        ];
      });
    }, 60000); // 1 minute of inactivity

    return () => clearTimeout(timer);
  }, [isOpen, isTyping, messages.length, inputValue]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;
    const newMsg: Message = { id: Date.now(), text, sender: "user" };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputValue("");
    setIsTyping(true);
    fetchGeminiResponse(updated);
  };

  const handleReset = () => {
    setMessages([{ id: Date.now(), text: `Hi ${userName}! 👋 How can I help you today?`, sender: "ai" }]);
  };

  const fetchGeminiResponse = async (chatHistory: Message[]) => {
    try {
      const validHistory: { role: string; parts: { text: string }[] }[] = [];
      let lastRole = "";

      chatHistory.forEach((msg) => {
        const role = msg.sender === "ai" ? "model" : "user";
        if (validHistory.length === 0 && role === "model") return;
        if (role !== lastRole) {
          validHistory.push({ role, parts: [{ text: msg.text }] });
          lastRole = role;
        } else if (validHistory.length > 0) {
          validHistory[validHistory.length - 1].parts[0].text += " \n " + msg.text;
        }
      });

      if (validHistory.length > 0 && validHistory[0].role === "user") {
        validHistory[0].parts[0].text =
          `System Prompt: You are a helpful, friendly, and concise support AI assistant for 'UniTrade', an exclusive peer-to-peer marketplace for Egyptian university students. Do not invent features that don't exist. Keep your answers short and polite.\n\nUser: ` +
          validHistory[0].parts[0].text;
      }

      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ chatHistory: validHistory }),
      });

      const data = await response.json();
      if (data.error) throw new Error(typeof data.error === "string" ? data.error : data.error?.message);

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to answer that.";
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: aiText, sender: "ai" }]);
    } catch (error: any) {
      setIsTyping(false);
      let msg = error.message || "Unknown error";
      if (msg.includes("Network request failed") || msg.includes("fetch")) {
        msg = "⚠️ Server offline. Please make sure the backend is running.";
      } else if (msg.toLowerCase().includes("too many")) {
        msg = "You're sending too quickly. Please wait a moment.";
      } else if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
        msg = "AI usage limit reached. Please try again in 60 seconds.";
      } else {
        msg = `Error: ${msg}`;
      }
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: msg, sender: "ai" }]);
    }
  };

  const slideStyle = {
    transform: [
      { translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT, 0] }) },
    ],
  };

  const border = darkMode ? "#1e293b" : "#e2e8f0";
  const inputBg = darkMode ? "#1e293b" : "#f8fafc";

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View style={[s.msgRow, isUser ? s.msgRowUser : s.msgRowAI]}>
        {!isUser && (
          <View style={s.aiAvatar}>
            <MaterialCommunityIcons name="robot" size={16} color="#2563eb" />
          </View>
        )}
        <View style={[s.bubble, isUser ? s.bubbleUser : [s.bubbleAI, { backgroundColor: theme.card, borderColor: border }]]}>
          <Text style={[s.bubbleText, { color: isUser ? "#fff" : theme.text }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  if (!user) return null;

  return (
    <>
      {/* ── Draggable FAB ── */}
      <Animated.View
        style={[
          s.fab,
          { transform: pan.getTranslateTransform() },
        ]}
        {...panResponder.panHandlers}
      >
        <PulseRing color="#3b82f6" />
        <TouchableOpacity
          style={s.fabInner}
          onPress={openChat}
          activeOpacity={0.85}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <MaterialCommunityIcons name="robot" size={28} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Chat Sheet Modal ── */}
      <Modal visible={isOpen} transparent animationType="none" statusBarTranslucent>
        <View style={s.overlay}>
          {/* Tap outside to close */}
          <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={closeChat} />

          {/* Sheet */}
          <Animated.View
            style={[
              s.sheet,
              { backgroundColor: theme.background },
              slideStyle,
              { height: SCREEN_HEIGHT * 0.85 } // Fixed height as requested
            ]}
          >
            {/* Inner content wrapper to handle spacing */}
            <View style={{ flex: 1 }}>
              {/* Header */}
              <View style={[s.sheetHeader, { backgroundColor: theme.card, borderBottomColor: border }]}>
                <View style={s.sheetHandle} />
                <View style={s.headerRow}>
                  <View style={s.headerLeft}>
                    <View style={s.headerIcon}>
                      <MaterialCommunityIcons name="robot" size={24} color="#2563eb" />
                    </View>
                    <View>
                      <Text style={[s.headerTitle, { color: theme.text }]}>UniTrade AI</Text>
                      <View style={s.onlineRow}>
                        <View style={s.onlineDot} />
                        <Text style={s.onlineText}>Online Now</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity onPress={handleReset} style={[s.headerBtn, { borderColor: border }]}>
                      <Feather name="refresh-cw" size={15} color={darkMode ? "#94a3b8" : "#64748b"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closeChat} style={[s.headerBtn, { borderColor: border }]}>
                      <Feather name="x" size={15} color={darkMode ? "#94a3b8" : "#64748b"} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Messages — flex: 1 so it shrinks and allows scrolling */}
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={s.messageList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1 }}
                ListFooterComponent={
                  isTyping ? (
                    <View style={[s.msgRow, s.msgRowAI]}>
                      <View style={s.aiAvatar}>
                        <MaterialCommunityIcons name="robot" size={16} color="#2563eb" />
                      </View>
                      <View style={[s.bubble, s.bubbleAI, { backgroundColor: theme.card, borderColor: border }]}>
                        <TypingDots />
                      </View>
                    </View>
                  ) : null
                }
              />

              {/* Input Area */}
              <View style={[s.inputArea, { backgroundColor: theme.card, borderTopColor: border }]}>
                <TextInput
                  style={[s.input, { backgroundColor: inputBg, color: theme.text, borderColor: border }]}
                  placeholder="Message UniTrade AI..."
                  placeholderTextColor={darkMode ? "#475569" : "#94a3b8"}
                  value={inputValue}
                  onChangeText={setInputValue}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  multiline
                />
                <TouchableOpacity
                  style={[s.sendBtn, { opacity: inputValue.trim() && !isTyping ? 1 : 0.4 }]}
                  onPress={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                >
                  {isTyping
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Feather name="send" size={17} color="#fff" />}
                </TouchableOpacity>
              </View>

              <View style={[s.poweredBy, { backgroundColor: theme.card, borderTopColor: border }]}>
                <Text style={{ fontSize: 11, color: "#94a3b8" }}>🤖 Powered by UniTrade AI</Text>
              </View>

              {/* Manual Spacer for Keyboard — Pushes input up without moving the whole sheet */}
              <View style={{ height: keyboardHeight }} />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  /* FAB */
  fab: {
    position: "absolute",
    left: 0,
    top: 0,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  fabInner: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },

  /* Modal overlay */
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.45)" },

  /* Sheet */
  sheet: {
    maxHeight: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    flexDirection: "column",
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginTop: 10, marginBottom: 10,
  },
  sheetHeader: {
    borderBottomWidth: 1,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center",
    shadowColor: "#2563eb", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  headerTitle: { fontSize: 15, fontWeight: "800", letterSpacing: -0.3 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#10b981" },
  onlineText: { fontSize: 11, color: "#10b981", fontWeight: "600" },
  headerBtn: {
    width: 32, height: 32, borderRadius: 8, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },

  /* Messages */
  messageList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: "row", marginBottom: 14, alignItems: "flex-end" },
  msgRowUser: { justifyContent: "flex-end" },
  msgRowAI: { justifyContent: "flex-start", gap: 8 },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center",
  },
  bubble: {
    maxWidth: "78%", paddingHorizontal: 13, paddingVertical: 9,
    borderRadius: 18,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  bubbleAI: { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontSize: 14, lineHeight: 21 },

  /* Input */
  inputArea: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1, borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9, fontSize: 14,
    maxHeight: 90, lineHeight: 20,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center",
    shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  poweredBy: {
    alignItems: "center", paddingVertical: 8,
    borderTopWidth: 1,
  },
});
