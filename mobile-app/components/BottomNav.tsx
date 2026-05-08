import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "../constants/ThemeContext";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const navigateTo = (route: string) => {
    // Prevent pushing the same screen if we are already there
    if (pathname === route) return;
    
    // Use navigate for tab-like behavior
    router.navigate(route as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0
        }
      ]}
    >
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigateTo("/Home/home")}
      >
        <Feather 
          name="home" 
          size={22} 
          color={pathname === "/Home/home" ? "#2563EB" : "#94a3b8"} 
        />
        <Text style={[styles.text, { color: pathname === "/Home/home" ? "#2563EB" : theme.text }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigateTo("/Sell/sell")}
      >
        <Feather 
          name="plus-circle" 
          size={22} 
          color={pathname === "/Sell/sell" ? "#2563EB" : "#94a3b8"} 
        />
        <Text style={[styles.text, { color: pathname === "/Sell/sell" ? "#2563EB" : theme.text }]}>Sell</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigateTo("/favorites/my-favorites")}
      >
        <Feather 
          name="heart" 
          size={22} 
          color={pathname === "/favorites/my-favorites" ? "#2563EB" : "#94a3b8"} 
        />
        <Text style={[styles.text, { color: pathname === "/favorites/my-favorites" ? "#2563EB" : theme.text }]}>Favorites</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigateTo("/Profile/profile")}
      >
        <Feather 
          name="user" 
          size={22} 
          color={pathname === "/Profile/profile" ? "#2563EB" : "#94a3b8"} 
        />
        <Text style={[styles.text, { color: pathname === "/Profile/profile" ? "#2563EB" : theme.text }]}>Account</Text>
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