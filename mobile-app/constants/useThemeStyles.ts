import { StyleSheet } from "react-native";
import { useTheme } from "./ThemeContext";

export default function useThemeStyles() {

  const { theme } = useTheme();

  const styles = StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 16,
    },

    text: {
      color: theme.text,
      fontSize: 16,
    },

    card: {
      backgroundColor: theme.card,
      padding: 12,
      borderRadius: 10,
      marginBottom: 10,
    }

  });

  return styles;
}