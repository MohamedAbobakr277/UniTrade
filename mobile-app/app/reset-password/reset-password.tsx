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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../services/firebase";
import PasswordRequirements, { validatePassword } from "../../components/PasswordRequirements";
import { useTheme } from "../../constants/ThemeContext";

export default function ResetPassword() {
  const { theme, darkMode } = useTheme();
  const router = useRouter();
  const { oobCode } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = async () => {
    setError("");

    if (!password || !confirm) {
      setError("Please fill all fields");
      return;
    }

    const reqs = validatePassword(password);
    if (!reqs.length || !reqs.uppercase || !reqs.lowercase || !reqs.number) {
      setError("Password does not meet all requirements");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!oobCode) {
      setError("Invalid or missing reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode as string, password);

      Alert.alert("Success", "Your password has been changed successfully.", [
        { text: "Login Now", onPress: () => router.replace("/") },
      ]);
    } catch (err: any) {
      console.log("RESET ERROR:", err);
      if (err.code === "auth/expired-action-code") {
        setError("The reset link has expired. Please request a new one.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("Invalid reset link. Please check your email again.");
      } else {
        setError(err.message || "Password reset failed. Please try again.");
      }
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
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[s.title, { color: textColor }]}>Set New Password</Text>
        </View>

        <View style={s.content}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={s.logo}
          />

          <Text style={[s.subtitle, { color: labelColor }]}>
            Create a strong password that you don't use elsewhere.
          </Text>

          {/* New Password */}
          <View style={s.inputGroup}>
            <View style={[s.inputWrap, { backgroundColor: inputBg }]}>
              <Feather name="shield" size={18} color="#2563eb" />
              <TextInput
                placeholder="New Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={[s.input, { color: textColor }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <PasswordRequirements password={password} />

          {/* Confirm Password */}
          <View style={s.inputGroup}>
            <View style={[s.inputWrap, { backgroundColor: inputBg }]}>
              <Feather name="check-circle" size={18} color="#2563eb" />
              <TextInput
                placeholder="Confirm New Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={setConfirm}
                style={[s.input, { color: textColor }]}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Feather name={showConfirm ? "eye" : "eye-off"} size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[s.submitBtn, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleChange}
            disabled={loading}
          >
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              style={s.gradient}
            >
              <Text style={s.submitText}>{loading ? "Updating..." : "Reset Password"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 12 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  title: { fontSize: 24, fontWeight: "800" },
  content: { alignItems: "center" },
  logo: { width: 100, height: 100, marginBottom: 24, resizeMode: "contain" },
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
});
