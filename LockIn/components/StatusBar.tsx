import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";

interface StatusBarProps {
  incompleteCount: number;
  totalCount: number;
}

export function TaskStatusBar({ incompleteCount, totalCount }: StatusBarProps) {
  const allDone = totalCount > 0 && incompleteCount === 0;
  const empty = totalCount === 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={[styles.container, allDone && styles.containerSuccess]}>
      <Text style={styles.date}>{today}</Text>
      {empty ? (
        <Text style={styles.text}>Add your tasks for today</Text>
      ) : allDone ? (
        <Text style={styles.text}>🎉 All done! Apps unlocked</Text>
      ) : (
        <Text style={styles.text}>
          🔒 {incompleteCount} of {totalCount} task{totalCount === 1 ? "" : "s"} left
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  containerSuccess: {
    backgroundColor: "#00B89420",
  },
  date: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});
