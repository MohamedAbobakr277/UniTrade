import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import styles from "./reset-styles";

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = () => {
    if (!password || !confirm) {
      setError("Fill all fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.title}>Reset Password</Text>

      {/* New Password */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="New Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color="#2563EB"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry={!showConfirm}
          value={confirm}
          onChangeText={setConfirm}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Feather
            name={showConfirm ? "eye" : "eye-off"}
            size={20}
            color="#2563EB"
          />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity onPress={handleChange}>
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Change Password</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}