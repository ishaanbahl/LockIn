import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
}

export function Checkbox({ checked, onPress, size = 22 }: CheckboxProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        { width: size, height: size },
        checked ? styles.checked : styles.unchecked,
      ]}
    >
      {checked && (
        <Ionicons name="checkmark" size={size * 0.8} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: 4, // Square with slight rounded corners to match Figma
    alignItems: "center",
    justifyContent: "center",
  },
  unchecked: {
    borderColor: "#000000",
    backgroundColor: "transparent",
  },
  checked: {
    borderColor: "#000000",
    backgroundColor: "#000000",
  },
});
