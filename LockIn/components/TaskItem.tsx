import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Task } from "../types/task";
import { Colors, Spacing, FontSize, BorderRadius } from "../constants/theme";

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  drag?: () => void;
  isActive?: boolean;
}

function formatDueTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function TaskItem({ task, onToggle, onDelete, drag, isActive }: TaskItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.containerActive]}
      onPress={onToggle}
      onLongPress={drag}
      delayLongPress={200}
      activeOpacity={0.7}
    >
      {/* Checkbox */}
      <View
        style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]}
      >
        {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {/* Title + optional due time */}
      <View style={styles.content}>
        <Text
          style={[styles.title, task.isCompleted && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.dueTime && (
          <Text
            style={[styles.dueTime, task.isCompleted && styles.dueTimeCompleted]}
          >
            🕐 {formatDueTime(task.dueTime)}
          </Text>
        )}
      </View>

      {/* Delete button */}
      <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={12}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  containerActive: {
    backgroundColor: Colors.surfaceLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.03 }],
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  dueTime: {
    color: Colors.primaryLight,
    fontSize: FontSize.xs,
    fontWeight: "500",
    marginTop: 2,
  },
  dueTimeCompleted: {
    color: Colors.textMuted,
  },
  deleteBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  deleteText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
});
