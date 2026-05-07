import { Stack } from "expo-router";
import { FavoriteProvider } from "../constants/FavoriteContext";
import { ThemeProvider } from "../constants/ThemeContext";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import FloatingChatbot from "../components/FloatingChatbot";

export default function Layout() {
  return (
    <ThemeProvider>
      <FavoriteProvider>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.root}>
            <Stack screenOptions={{ headerShown: false }} />
            <FloatingChatbot />
          </View>
        </KeyboardAvoidingView>
      </FavoriteProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});