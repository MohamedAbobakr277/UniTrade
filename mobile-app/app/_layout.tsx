import React, { useState } from "react";
import {
  View, Text,TextInput,StyleSheet,TouchableOpacity,Image,StatusBar,} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import styles from "./styles";  

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Logo */}
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
       
      />

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      {/* Email */}
      <View style={styles.inputBox}>
        <Feather name="mail" size={18} color="#396cda" />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
      </View>

      {/* Password */}
      <View style={styles.inputBox}>
        <Feather name="lock" size={18} color="#4b76d2" />
        <TextInput
          placeholder="Password"
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

      <Text style={styles.forgot}>Forgot Password?</Text>

      {/* Button */}
      <TouchableOpacity style={styles.button}>
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.signup}>
        Don’t have an account?{" "}
        <Text style={{ color: "#2563EB", fontWeight: "600" }}>
          Sign Up
        </Text>
      </Text>
    </View>
  );
}

