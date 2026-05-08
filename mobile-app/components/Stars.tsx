import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface StarsProps {
  value: number;
  size?: number;
  interactive?: boolean;
  onSelect?: (value: number) => void;
  gap?: number;
}

export const Stars = ({
  value,
  size = 14,
  interactive = false,
  onSelect,
  gap = 2,
}: StarsProps) => {
  return (
    <View style={[styles.container, { gap }]}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => onSelect?.(i)}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: size,
              color: i <= Math.round(value) ? "#f59e0b" : "#d1d5db",
            }}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
});
