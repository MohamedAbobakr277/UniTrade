import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from "firebase/auth";
import { auth } from "../services/firebase";
import { getFriendlyAuthError } from "../services/auth";
import { useTheme } from "../../constants/ThemeContext";
import PasswordRequirements, { validatePassword } from "../../components/PasswordRequirements";
import { LinearGradient } from "expo-linear-gradient";

export default function ChangePassword() {
  const { theme, darkMode } = useTheme();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const reqs = validatePassword(newPassword);
  const isPassValid = reqs.length && reqs.uppercase && reqs.lowercase && reqs.number;

  const handleUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (!isPassValid) {
      Alert.alert("Error", "New password does not meet requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("No user found");

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      Alert.alert("Success", "Password updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.log(err);
      const errorMsg = err.code ? getFriendlyAuthError(err.code) : (err.message || "Failed to update password");
      Alert.alert("Error", errorMsg);
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
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[s.title, { color: textColor }]}>Change Password</Text>
        </View>

        <Text style={[s.subtitle, { color: labelColor }]}>
          Your new password must be different from your previous one.
        </Text>

        {/* Current Password */}
        <View style={s.inputGroup}>
          <Text style={[s.label, { color: labelColor }]}>Current Password</Text>
          <View style={[s.inputWrap, { backgroundColor: inputBg }]}>
            <Feather name="lock" size={18} color="#2563eb" />
            <TextInput
              secureTextEntry={!showCurrent}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#9ca3af"
              style={[s.input, { color: textColor }]}
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <Feather name={showCurrent ? "eye" : "eye-off"} size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={s.inputGroup}>
          <Text style={[s.label, { color: labelColor }]}>New Password</Text>
          <View style={[s.inputWrap, { backgroundColor: inputBg }]}>
            <Feather name="shield" size={18} color="#2563eb" />
            <TextInput
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#9ca3af"
              style={[s.input, { color: textColor }]}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Feather name={showNew ? "eye" : "eye-off"} size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <PasswordRequirements password={newPassword} />

        {/* Confirm Password */}
        <View style={s.inputGroup}>
          <Text style={[s.label, { color: labelColor }]}>Confirm New Password</Text>
          <View style={[s.inputWrap, { backgroundColor: inputBg }]}>
            <Feather name="check-circle" size={18} color="#2563eb" />
            <TextInput
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat new password"
              placeholderTextColor="#9ca3af"
              style={[s.input, { color: textColor }]}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Feather name={showConfirm ? "eye" : "eye-off"} size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {confirmPassword.length > 0 && confirmPassword !== newPassword && (
          <Text style={s.errorText}>Passwords do not match</Text>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[s.submitBtn, { opacity: (loading || !isPassValid || confirmPassword !== newPassword) ? 0.6 : 1 }]}
          onPress={handleUpdate}
          disabled={loading || !isPassValid || confirmPassword !== newPassword}
        >
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            style={s.gradient}
          >
            <Text style={s.submitText}>{loading ? "Updating..." : "Update Password"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 14, marginBottom: 28, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
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
  submitBtn: {
    marginTop: 10,
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
  errorText: { color: "#ef4444", fontSize: 12, marginTop: -12, marginBottom: 20, marginLeft: 4 },
});
