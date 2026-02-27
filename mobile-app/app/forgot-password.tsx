import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import styles from "./forgot-styles";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleNext = () => {
    if (!email||!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    router.push({ pathname: "/reset-password", params: { email } });
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
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity onPress={handleNext}>
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}