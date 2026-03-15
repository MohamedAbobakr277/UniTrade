import { Stack } from "expo-router";
import { FavoriteProvider } from "../constants/FavoriteContext";
import { ThemeProvider } from "../constants/ThemeContext";

export default function Layout() {
  return (
    <ThemeProvider>
      <FavoriteProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </FavoriteProvider>
    </ThemeProvider>
  );
}