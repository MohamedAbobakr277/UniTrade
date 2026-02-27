// app/forgot-password.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import styles from "./forgot-styles";

// Import Firebase auth service
import { forgotPassword } from "./services/auth"; // path حسب موقع auth.js في الموبايل

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleNext = async () => {
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      Alert.alert(
        "Success",
        "Password reset email sent. Check your inbox."
      );
      router.push("/reset-password"); // تعديل حسب مسار صفحة reset-password
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
        style={[styles.input, error && { borderColor: "red" }]}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        onPress={handleNext}
        disabled={loading}
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Continue"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPassword;