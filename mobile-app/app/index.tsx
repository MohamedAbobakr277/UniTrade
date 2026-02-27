import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "./styles";

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        style={[
          styles.button,
          { opacity: email && password ? 1 : 0.6 },
        ]}
        disabled={!email || !password}
      >
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </LinearGradient>

        <Text style={styles.signup}>
       Don’t have an account?{" "}
     <Text
    style={{ color: "#2563EB", fontWeight: "600" }}
    onPress={() => router.push("/signup")}
     >
    Sign Up
  </Text>
  </Text>
      </TouchableOpacity>
    </View>
  );
}