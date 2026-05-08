import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../constants/ThemeContext";
import { forgotPassword } from "../services/auth";

export default function ForgotPassword() {
  const { theme, darkMode } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSend = async () => {
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid university email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      Alert.alert(
        "Check your Email",
        "A password reset link has been sent to your email address.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const inputBg = theme.card;
  const textColor = theme.text;
  const labelColor = darkMode ? "#94a3b8" : "#64748b";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.container}>
          <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Feather name="arrow-left" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          <View style={s.content}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={s.logo}
            />

            <Text style={[s.title, { color: textColor }]}>Forgot Password?</Text>
            <Text style={[s.subtitle, { color: labelColor }]}>
              Enter your university email address and we'll send you a link to reset your password.
            </Text>

            {/* Email Input */}
            <View style={s.inputGroup}>
              <View style={[s.inputWrap, { backgroundColor: inputBg }]}>
                <Feather name="mail" size={18} color="#2563eb" />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(""); }}
                  style={[s.input, { color: textColor }]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {error ? <Text style={s.errorText}>{error}</Text> : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[s.submitBtn, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleSend}
              disabled={loading}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={s.gradient}
              >
                <Text style={s.submitText}>{loading ? "Sending..." : "Send Reset Link"}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
              <Text style={[s.cancelText, { color: "#2563eb" }]}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { paddingTop: 40, marginBottom: 20 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  content: { flex: 1, alignItems: "center" },
  logo: { width: 100, height: 100, marginBottom: 32, resizeMode: "contain" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 12 },
  subtitle: { fontSize: 15, textAlign: "center", marginBottom: 32, lineHeight: 22 },
  inputGroup: { width: "100%", marginBottom: 16 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  input: { flex: 1, height: "100%", fontSize: 15, paddingHorizontal: 12 },
  errorText: { color: "#ef4444", fontSize: 13, marginBottom: 20, alignSelf: "flex-start", marginLeft: 4 },
  submitBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: { paddingVertical: 16, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelBtn: { marginTop: 24 },
  cancelText: { fontSize: 15, fontWeight: "600" },
});