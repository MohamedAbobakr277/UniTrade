import { Stack } from "expo-router";
import { FavoriteProvider } from "../constants/FavoriteContext";

export default function Layout() {

  return (
    <FavoriteProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </FavoriteProvider>
  );

}