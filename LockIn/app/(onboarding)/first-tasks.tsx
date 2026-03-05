import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useTaskStore } from "../../store/taskStore";
import { useAppStore } from "../../store/appStore";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants/theme";

export default function FirstTasksScreen() {
  const [tasks, setTasks] = useState(["", "", ""]);
  const addTask = useTaskStore((s) => s.addTask);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const updateTask = (index: number, value: string) => {
    const updated = [...tasks];
    updated[index] = value;
    setTasks(updated);
  };

  const addMoreSlot = () => {
    setTasks([...tasks, ""]);
  };

  const handleFinish = () => {
    // Add non-empty tasks
    const validTasks = tasks.filter((t) => t.trim().length > 0);
    validTasks.forEach((title) => addTask(title.trim()));

    // Mark onboarding complete
    completeOnboarding();

    // Navigate to main app
    router.replace("/(tabs)");
  };

  const filledCount = tasks.filter((t) => t.trim().length > 0).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>What do you need to do?</Text>
        <Text style={styles.subtitle}>
          Add a few tasks to get started. These apps stay blocked until you check
          them all off.
        </Text>

        <View style={styles.taskInputs}>
          {tasks.map((task, index) => (
            <View key={index} style={styles.inputRow}>
              <View style={styles.inputCheckbox}>
                <Text style={styles.inputNumber}>{index + 1}</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={
                  index === 0
                    ? "e.g. Finish homework"
                    : index === 1
                    ? "e.g. Go to the gym"
                    : index === 2
                    ? "e.g. Read 20 pages"
                    : "Another task..."
                }
                placeholderTextColor={Colors.textMuted}
                value={task}
                onChangeText={(v) => updateTask(index, v)}
                returnKeyType="next"
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.addMore}
            onPress={addMoreSlot}
            activeOpacity={0.7}
          >
            <Text style={styles.addMoreText}>+ Add another</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, filledCount === 0 && styles.buttonDisabled]}
          onPress={handleFinish}
          activeOpacity={0.8}
          disabled={filledCount === 0}
        >
          <Text style={styles.buttonText}>
            {filledCount === 0
              ? "Add at least 1 task"
              : `Lock In with ${filledCount} task${filledCount === 1 ? "" : "s"}`}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 80,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: "800",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  taskInputs: {
    gap: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  inputCheckbox: {
    width: 44,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceLight,
  },
  inputNumber: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    padding: Spacing.md,
  },
  addMore: {
    padding: Spacing.md,
    alignItems: "center",
  },
  addMoreText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
});
