import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

export default function BottomNav() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.card,
          borderTopWidth: 0, // إخفاء الخط الأبيض تماماً
          elevation: 0,      // إلغاء الظل في أندرويد لمنع أي خطوط
          shadowOpacity: 0   // إلغاء الظل في iOS
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.item} 
        onPress={() => router.push("/Home/home")}
      >
        <Feather name="home" size={22} color="#2563EB" />
        <Text style={[styles.text, { color: theme.text }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.item} 
        onPress={() => router.push("/Sell/sell")}
      >
        <Feather name="plus-circle" size={22} color="#2563EB" />
        <Text style={[styles.text, { color: theme.text }]}>Sell</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.item} 
        onPress={() => router.push("/favorites/my-favorites")}
      >
        <Feather name="heart" size={22} color="#2563EB" />
        <Text style={[styles.text, { color: theme.text }]}>Favorites</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.item} 
        onPress={() => router.push("/Profile/profile")}
      >
        <Feather name="user" size={22} color="#2563EB" />
        <Text style={[styles.text, { color: theme.text }]}>Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Platform.OS === 'ios' ? 15 : 0,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  text: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  }
});