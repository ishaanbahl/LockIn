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
import { Checkbox } from "./Checkbox";

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  drag?: () => void;
  isActive?: boolean;
}

function formatDueTime(hhmm: string): string {
  // If it's already HH:MM, just return it. Figma says "11:59".
  return hhmm;
}

export function TaskItem({ task, onToggle, onDelete, drag, isActive }: TaskItemProps) {
  // Simple heuristic for subtasks if you want to support indentation later
  const isSubtask = task.title.toLowerCase().startsWith("wrap up");

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && styles.containerActive,
        isSubtask && styles.indentedContainer,
      ]}
      onPress={onToggle}
      onLongPress={drag}
      delayLongPress={200}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <Checkbox checked={task.isCompleted} onPress={onToggle} size={20} />
        <Text
          style={[styles.title, task.isCompleted && styles.titleCompleted]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
      </View>

      <View style={styles.rightContent}>
        {task.dueTime && (
          <View style={styles.duePill}>
            <Text style={styles.dueLabel}>DUE: </Text>
            <Text style={styles.dueTimeText}>{formatDueTime(task.dueTime)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
    marginBottom: Spacing.xs,
  },
  indentedContainer: {
    marginLeft: 32, // Indent for subtasks based on Figma
  },
  containerActive: {
    backgroundColor: Colors.surface, // Slight white bg when dragging
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    transform: [{ scale: 1.02 }],
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: "400",
    marginLeft: Spacing.md,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  duePill: {
    flexDirection: "row",
    backgroundColor: Colors.border, // Light gray
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  dueLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs - 2,
    fontWeight: "700", // Bold "DUE:"
  },
  dueTimeText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs - 2,
    fontWeight: "400",
  },
});
