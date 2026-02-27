// mobile-app/app/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "./styles";

// Import auth service from local services
import { login } from "./services/auth";

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Invalid email format.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password); // should return a promise that resolves on successful login
      Alert.alert("Success", "Login successful!");
      router.push("/"); // redirect to home page after successful login
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <View style={styles.inputBox}>
        <Feather name="mail" size={18} color="#396cda" />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
      </View>

      <View style={styles.inputBox}>
        <Feather name="lock" size={18} color="#4b76d2" />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={18}
            color="#2563EB"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push("/forgot-password")}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { opacity: email && password ? 1 : 0.6 }]}
        disabled={!email || !password || loading}
        onPress={handleLogin}
      >
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.signup}>
        Don’t have an account?{" "}
        <Text
          style={{ color: "#2563EB", fontWeight: "600" }}
          onPress={() => router.push("/signup")}
        >
          Sign Up
        </Text>
      </Text>
    </View>
  );
};

export default LoginScreen;