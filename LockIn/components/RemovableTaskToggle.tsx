import React from "react";
import { View, Text, Switch, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";

interface RemovableTaskToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function RemovableTaskToggle({ value, onValueChange, style }: RemovableTaskToggleProps) {
  return (
    <View style={[styles.clearableRow, style]}>
      <View style={styles.textContainer}>
        <Text style={styles.clearableRowTitle}>Removable Task</Text>
        <Text style={styles.clearableRowSubtitle}>Can be bulk cleared in Settings</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.danger }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clearableRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  textContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  clearableRowTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: "600",
    marginBottom: 2,
  },
  clearableRowSubtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
});
